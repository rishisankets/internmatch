import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

ADZUNA_APP_ID  = "dc78213f"
ADZUNA_APP_KEY = "f266c4e9b652c552f0099b7d2b1ed132"

def get_recommendations(answers):
    # Build user profile string from all answers
    user_profile = " ".join([a for a in answers if a])

    # Always use a broad query to get maximum results
    query = "intern internship graduate trainee"

    # Fetch from Adzuna
    url = "https://api.adzuna.com/v1/api/jobs/in/search/1"
    params = {
        "app_id": ADZUNA_APP_ID,
        "app_key": ADZUNA_APP_KEY,
        "results_per_page": 20,
        "what": query,
        "content-type": "application/json"
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

    # Build description string for each job
    internship_texts = []
    for job in jobs:
        title       = job.get("title", "")
        company     = job.get("company", {}).get("display_name", "")
        location    = job.get("location", {}).get("display_name", "")
        description = job.get("description", "")
        text        = f"{title} {company} {location} {description[:300]}"
        internship_texts.append(text)

    # TF-IDF + cosine similarity
    all_texts  = [user_profile] + internship_texts
    vectorizer = TfidfVectorizer(stop_words="english")
    vectors    = vectorizer.fit_transform(all_texts)
    scores     = cosine_similarity(vectors[0:1], vectors[1:]).flatten()

    # Attach scores and sort
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

    results.sort(key=lambda x: x["match"], reverse=True)
    return results[:10]