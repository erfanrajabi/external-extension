import requests
import json
# مقدار جدید موجودی را تعریف کنید
balance = 5.0000000000
# اتصال به API وب اپ
url = "https://user.minerone.vip/api/v1/wallets"
headers = {"Authorization": "Bearer PHOEIBZDJLDEYLMT"}
# درخواست به API
response = requests.post(url, headers=headers, json={"id": "Erfanrajabi", "balance": balance})
# بررسی پاسخ
if response.status_code == 200:
    # مقدار موجودی را در پایگاه داده ذخیره کنید
    data = response.json()
    db.wallets.update_one({"id": "Erfanrajabi"}, {"$set": {"balance": balance}})
    print("مقدار موجودی با موفقیت تغییر یافت")
else:
    print("خطا در تغییر مقدار موجودی")
