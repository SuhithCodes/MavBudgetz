import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class TestLogin(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.get("http://localhost:3000")
        time.sleep(5)

    def test_login(self):
        driver = self.driver

        # Fill out the login form with correct credentials
        username = "kxr0701@mavs.uta.edu"
        password = "clerkclerkp"

        username_field = driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div/div/div[1]/div[2]/form/div/div[1]/div/div[1]/input")
        username_field.send_keys(username)
        username_field.send_keys(Keys.RETURN)
        time.sleep(3)

        password_field = driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div/div/div[1]/div[2]/form/div/div/div[1]/div[2]/input")
        password_field.send_keys(password)
        password_field.send_keys(Keys.RETURN)
        time.sleep(3)

        # Wait for login success message or URL change
        try:
            WebDriverWait(driver, 20).until(EC.url_matches("http://localhost:3000"))
        except Exception as e:
            self.fail(f"Login failed or timed out: {e}")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
