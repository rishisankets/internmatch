import requests
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

ADZUNA_APP_ID  = "dc78213f"
ADZUNA_APP_KEY = "f266c4e9b652c552f0099b7d2b1ed132"

def get_recommendations(answers):
    # Full user profile for ML matching
    user_profile = " ".join([a for a in answers if a])

    # Use first 3 answers for the search query
    # Q1 = job title, Q2 = skills, Q3 = industry
    # These directly match Adzuna listings
    query_words = []

    if answers[0]: query_words.append(answers[0])  # job title
    if answers[1]: query_words.append(answers[1])  # skills
    if answers[2]: query_words.append(answers[2])  # industry

    # Clean and build query
    query = " ".join(query_words).replace(",", " ").strip()

    # Fallback if query is empty
    if not query:
        query = "software developer analyst"

    print(f"Query sent to Adzuna: {query}")

    # Try primary query first
    jobs = fetch_jobs(query, 20)

    # If not enough results, try just the job title
    if len(jobs) < 5 and answers[0]:
        print("Retrying with job title only...")
        jobs = fetch_jobs(answers[0].split(",")[0], 20)

    # Last resort — broad search
    if len(jobs) < 5:
        print("Retrying with broad search...")
        jobs = fetch_jobs("developer analyst engineer", 20)

    if not jobs:
        return []

    print(f"Total jobs fetched: {len(jobs)}")

    # Build rich text for each job
    internship_texts = []
    for job in jobs:
        title       = job.get("title", "")
        company     = job.get("company", {}).get("display_name", "")
        location    = job.get("location", {}).get("display_name", "")
        description = job.get("description", "")
        category    = job.get("category", {}).get("label", "")
        # Repeat title 3x to give it more weight in TF-IDF
        text = f"{title} {title} {title} {company} {location} {category} {description[:500]}"
        internship_texts.append(text)

    # TF-IDF + cosine similarity
    all_texts  = [user_profile] + internship_texts
    vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2), max_features=5000)
    vectors    = vectorizer.fit_transform(all_texts)
    scores     = cosine_similarity(vectors[0:1], vectors[1:]).flatten()

    # Build results
    results = []
    for i, job in enumerate(jobs):
        # Scale score — multiply by 2, cap at 99
        match = min(round(float(scores[i]) * 200, 1), 99)
        results.append({
            "title":    job.get("title", "N/A"),
            "company":  job.get("company", {}).get("display_name", "N/A"),
            "location": job.get("location", {}).get("display_name", "N/A"),
            "url":      job.get("redirect_url", "#"),
            "match":    match
        })

    results.sort(key=lambda x: x["match"], reverse=True)
    return results[:10]


def fetch_jobs(query, count):
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
        return data.get("results", [])
    except Exception as e:
        print("Adzuna fetch error:", e)
        return []