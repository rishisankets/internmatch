import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

ADZUNA_APP_ID  = "dc78213f"
ADZUNA_APP_KEY = "f266c4e9b652c552f0099b7d2b1ed132"

def fetch_jobs(query, count=20):
    url = "https://api.adzuna.com/v1/api/jobs/in/search/1"
    params = {
        "app_id":           ADZUNA_APP_ID,
        "app_key":          ADZUNA_APP_KEY,
        "results_per_page": count,
        "what":             query,
        "content-type":     "application/json"
    }
    try:
        response = requests.get(url, params=params, timeout=10)
        data     = response.json()
        jobs     = data.get("results", [])
        print(f"Query: '{query}' → {len(jobs)} jobs returned")
        return jobs
    except Exception as e:
        print("Adzuna error:", e)
        return []

def get_recommendations(answers):
    # Build rich user profile from ALL answers
    user_profile = " ".join([a for a in answers if a])
    print(f"User profile: {user_profile}")

    # Try multiple queries and combine results
    all_jobs = []
    seen_ids = set()

    # Query 1 — first answer (job title)
    if answers[0]:
        jobs = fetch_jobs(answers[0].split(",")[0].strip(), 20)
        for j in jobs:
            if j.get("id") not in seen_ids:
                all_jobs.append(j)
                seen_ids.add(j.get("id"))

    # Query 2 — second answer (skills)
    if answers[1]:
        jobs = fetch_jobs(answers[1].split(",")[0].strip(), 20)
        for j in jobs:
            if j.get("id") not in seen_ids:
                all_jobs.append(j)
                seen_ids.add(j.get("id"))

    # Query 3 — combined title + skill
    if answers[0] and answers[1]:
        q = answers[0].split(",")[0].strip() + " " + answers[1].split(",")[0].strip()
        jobs = fetch_jobs(q, 20)
        for j in jobs:
            if j.get("id") not in seen_ids:
                all_jobs.append(j)
                seen_ids.add(j.get("id"))

    # Fallback — broad search if still not enough
    if len(all_jobs) < 10:
        for q in ["software intern", "data analyst intern", "developer trainee", "graduate intern"]:
            jobs = fetch_jobs(q, 20)
            for j in jobs:
                if j.get("id") not in seen_ids:
                    all_jobs.append(j)
                    seen_ids.add(j.get("id"))
            if len(all_jobs) >= 20:
                break

    print(f"Total unique jobs fetched: {len(all_jobs)}")

    if not all_jobs:
        return []

    # Build description for each job
    internship_texts = []
    for job in all_jobs:
        title    = job.get("title", "")
        company  = job.get("company", {}).get("display_name", "")
        location = job.get("location", {}).get("display_name", "")
        desc     = job.get("description", "")
        category = job.get("category", {}).get("label", "")
        # Repeat title 3x so it gets more weight
        text = f"{title} {title} {title} {company} {location} {category} {desc[:400]}"
        internship_texts.append(text)

    # TF-IDF + cosine similarity
    all_texts  = [user_profile] + internship_texts
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=5000)
    vectors    = vectorizer.fit_transform(all_texts)
    scores     = cosine_similarity(vectors[0:1], vectors[1:]).flatten()

    # Build results with scaled scores
    results = []
    for i, job in enumerate(all_jobs):
        raw_score = float(scores[i])
        # Scale score — multiply by 3, cap at 99
        match = min(round(raw_score * 300, 1), 99)
        results.append({
            "title":    job.get("title", "N/A"),
            "company":  job.get("company", {}).get("display_name", "N/A"),
            "location": job.get("location", {}).get("display_name", "N/A"),
            "url":      job.get("redirect_url", "#"),
            "match":    match
        })

    # Sort and return top 10
    results.sort(key=lambda x: x["match"], reverse=True)
    top10 = results[:10]

    print(f"Top match: {top10[0]['match']}% — {top10[0]['title']}" if top10 else "No results")
    return top10