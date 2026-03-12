import requests
import sys

BASE_URL = "http://localhost:8000"

def run_diagnostic():
    print("🚀 Starting ResearchHub AI Backend Diagnostic...\n")
    
    # Test 1: Root Endpoint (Server Check)
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print("✅ [PASS] Server is LIVE (Root Endpoint)")
        else:
            print("❌ [FAIL] Server returned status:", response.status_code)
    except:
        print("❌ [FAIL] Server is NOT REACHABLE. Check if uvicorn is running.")
        return

    # Test 2: Swagger Documentation (FastAPI Check)
    try:
        response = requests.get(f"{BASE_URL}/docs")
        if response.status_code == 200:
            print("✅ [PASS] API Documentation (Swagger) is accessible")
    except:
        print("❌ [FAIL] Swagger UI is broken.")

    # Test 3: Workspace List (Database Check)
    try:
        response = requests.get(f"{BASE_URL}/api/papers/workspaces")
        if response.status_code == 200:
            print(f"✅ [PASS] Database Connection OK (Found {len(response.json())} workspaces)")
        else:
            print("❌ [FAIL] Database query failed.")
    except:
        print("❌ [FAIL] Could not connect to Database API.")

    # Test 4: CORS Preflight (Deployment Readiness)
    try:
        headers = {
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        }
        response = requests.options(f"{BASE_URL}/api/papers/chat", headers=headers)
        if response.status_code == 200:
            print("✅ [PASS] CORS Policy is correctly configured for Frontend")
    except:
        print("❌ [FAIL] CORS Policy might block Frontend requests.")

    print("\n-------------------------------------------")
    print("🎯 Diagnostic Complete: Milestone 6 Validation Done!")
    print("-------------------------------------------")

if __name__ == "__main__":
    run_diagnostic()