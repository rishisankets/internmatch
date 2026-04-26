import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

ADZUNA_APP_ID  = "dc78213f"
ADZUNA_APP_KEY = "f266c4e9b652c552f0099b7d2b1ed132"

def get_recommendations(answers):
    # Step 1 — Build user profile string from quiz answers
    user_profile = " ".join([a for a in answers if a])

    # Step 2 — Build search query from key answers
    # answers[0]=field, answers[1]=skill, answers[8]=location
    field    = answers[0] if answers[0] else "internship"
    skill    = answers[1] if answers[1] else ""
    location = answers[8] if answers[8] else "india"

    query = f"{field} {skill} intern".strip()

    # Step 3 — Fetch internships from Adzuna API
    url = f"https://api.adzuna.com/v1/api/jobs/in/search/1"
    params = {
        "app_id":         ADZUNA_APP_ID,
        "app_key":        ADZUNA_APP_KEY,
        "results_per_page": 20,
        "what":           query,
        "where":          location if location != "Any city" else "india",
        "content-type":   "application/json"
    }

    try:
        response = requests.get(url, params=params)
        data     = response.json()
        jobs     = data.get("results", [])
    except Exception as e:
        print("Adzuna API error:", e)
        return []

    if not jobs:
        return []

    # Step 4 — Build description string for each internship
    internship_texts = []
    for job in jobs:
        title       = job.get("title", "")
        company     = job.get("company", {}).get("display_name", "")
        location    = job.get("location", {}).get("display_name", "")
        description = job.get("description", "")
        text        = f"{title} {company} {location} {description[:200]}"
        internship_texts.append(text)

    # Step 5 — Run TF-IDF + cosine similarity
    all_texts  = [user_profile] + internship_texts
    vectorizer = TfidfVectorizer(stop_words="english")
    vectors    = vectorizer.fit_transform(all_texts)
    scores     = cosine_similarity(vectors[0:1], vectors[1:]).flatten() # type: ignore

    # Step 6 — Attach scores to jobs and sort
    results = []
    for i, job in enumerate(jobs):
        match = round(float(scores[i]) * 100, 1)
        results.append({
            "title":    job.get("title", "N/A"),
            "company":  job.get("company", {}).get("display_name", "N/A"),
            "location": job.get("location", {}).get("display_name", "N/A"),
            "url":      job.get("redirect_url", "#"),
            "match":    match
        })

    # Sort by match % descending
    results.sort(key=lambda x: x["match"], reverse=True)
    return results[:10]  # return top 10