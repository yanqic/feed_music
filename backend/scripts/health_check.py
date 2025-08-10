#!/usr/bin/env python3
"""
健康检查脚本
用于验证Vercel部署后的API是否正常工作

使用方法:
python scripts/health_check.py https://your-api.vercel.app
"""

import sys
import requests
import json
from urllib.parse import urljoin


def check_endpoint(base_url, endpoint, expected_status=200, description=""):
    """检查单个端点"""
    url = urljoin(base_url, endpoint)
    try:
        response = requests.get(url, timeout=10)
        status = "✅" if response.status_code == expected_status else "❌"
        print(f"{status} {description or endpoint}: {response.status_code}")
        
        if response.status_code == expected_status:
            return True, response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
        else:
            return False, f"Expected {expected_status}, got {response.status_code}"
            
    except requests.exceptions.RequestException as e:
        print(f"❌ {description or endpoint}: Connection error - {e}")
        return False, str(e)


def test_user_registration_and_login(base_url):
    """测试用户注册和登录功能"""
    print("\n🧪 Testing user registration and login...")
    
    # 测试用户数据
    test_user = {
        "username": "testuser",
        "email": "test@example.com",
        "password": "testpass123"
    }
    
    # 1. 测试用户注册
    register_url = urljoin(base_url, "/api/v1/users/register")
    try:
        response = requests.post(register_url, json=test_user, timeout=10)
        if response.status_code in [200, 201]:
            print("✅ User registration: Success")
        elif response.status_code == 400:
            print("⚠️  User registration: User might already exist")
        else:
            print(f"❌ User registration: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ User registration: {e}")
        return False
    
    # 2. 测试用户登录
    login_url = urljoin(base_url, "/api/v1/users/login")
    login_data = {
        "username": test_user["username"],
        "password": test_user["password"]
    }
    
    try:
        response = requests.post(login_url, data=login_data, timeout=10)
        if response.status_code == 200:
            result = response.json()
            if "access_token" in result:
                print("✅ User login: Success")
                return True, result["access_token"]
            else:
                print("❌ User login: No access token in response")
                return False
        else:
            print(f"❌ User login: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ User login: {e}")
        return False


def test_protected_endpoints(base_url, token):
    """测试需要认证的端点"""
    print("\n🔒 Testing protected endpoints...")
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # 测试获取当前用户信息
    me_url = urljoin(base_url, "/api/v1/users/me")
    try:
        response = requests.get(me_url, headers=headers, timeout=10)
        if response.status_code == 200:
            print("✅ Get current user: Success")
            return True
        else:
            print(f"❌ Get current user: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Get current user: {e}")
        return False


def main():
    """主函数"""
    if len(sys.argv) != 2:
        print("Usage: python scripts/health_check.py <base_url>")
        print("Example: python scripts/health_check.py https://your-api.vercel.app")
        sys.exit(1)
    
    base_url = sys.argv[1].rstrip('/')
    
    print("=" * 60)
    print(f"Feed Music API Health Check")
    print(f"Target: {base_url}")
    print("=" * 60)
    
    # 基础端点检查
    print("\n🏥 Basic endpoint checks...")
    
    endpoints = [
        ("/", "Root endpoint"),
        ("/health", "Health check"),
        ("/api/v1/docs", "API documentation"),
        ("/api/v1/openapi.json", "OpenAPI schema"),
    ]
    
    basic_checks_passed = 0
    for endpoint, description in endpoints:
        success, _ = check_endpoint(base_url, endpoint, description=description)
        if success:
            basic_checks_passed += 1
    
    print(f"\nBasic checks: {basic_checks_passed}/{len(endpoints)} passed")
    
    if basic_checks_passed < len(endpoints):
        print("\n⚠️  Some basic checks failed. The API might not be fully functional.")
    
    # 用户功能测试
    auth_result = test_user_registration_and_login(base_url)
    if isinstance(auth_result, tuple) and auth_result[0]:
        token = auth_result[1]
        test_protected_endpoints(base_url, token)
    
    # 总结
    print("\n" + "=" * 60)
    if basic_checks_passed == len(endpoints):
        print("✅ Health check completed successfully!")
        print("\nYour API is ready to use:")
        print(f"📖 API Docs: {base_url}/api/v1/docs")
        print(f"🔍 Health: {base_url}/health")
    else:
        print("❌ Health check completed with issues.")
        print("\nPlease check:")
        print("1. Environment variables are correctly set")
        print("2. Database connection is working")
        print("3. Vercel deployment logs for errors")
    print("=" * 60)


if __name__ == "__main__":
    main()