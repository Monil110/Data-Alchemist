import requests

API_KEY = "AIzaSyB8lCAkJIHdukBB5zlZfiEnLpAbZn90VnQ"
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

response = requests.get(url)
print(response.json())