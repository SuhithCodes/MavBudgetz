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

    def test_login_with_incorrect_credentials(self):
        driver = self.driver

        # Fill out the login form with incorrect credentials
        username = "nonexistent@gmail.com"
        password = "wrongpwd@9k"

        username_field = driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div/div/div[1]/div[2]/form/div/div[1]/div/div[1]/input")
        username_field.send_keys(username)
        username_field.send_keys(Keys.RETURN)
        time.sleep(3)

        # Wait for error message element to appear
        try:
            error_message = WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.XPATH, "/html/body/div[1]/div/div[2]/div/div/div[1]/div[2]/form/div/div[1]/div/div[2]/p[2]")))
            self.assertIn("Couldn't find your account.", error_message.text, "Error message not displayed correctly")
        except Exception as e:
            self.fail(f"No error message displayed or timed out: {e}")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
