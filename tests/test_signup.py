import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class TestSignUp(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.get("http://localhost:3000")
        time.sleep(2)

    def test_signup_with_valid_credentials(self):
        driver = self.driver
        
        # Go to signup page
        signup_link = driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div/div/div[2]/div[1]/a")
        signup_link.click()
        
        time.sleep(5)

        # Fill out the signup form with valid credentials
        email = "new_user123@gmail.com"
        password = "Cyec21tihlff"

        f_name = driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div/div/div[1]/div[2]/form/div[1]/div[1]/div[1]/div[1]/input")
        l_name = driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div/div/div[1]/div[2]/form/div[1]/div[1]/div[2]/div[1]/input")
        email_field = driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div/div/div[1]/div[2]/form/div[1]/div[2]/div/div[1]/input")
        password_field = driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div/div/div[1]/div[2]/form/div[1]/div[3]/div/div[1]/div[2]/input")

        f_name.send_keys("test")
        time.sleep(2)
        l_name.send_keys("test")
        time.sleep(2)
        email_field.send_keys(email)
        time.sleep(2)
        password_field.send_keys(password)
        time.sleep(2)
        password_field.send_keys(Keys.RETURN)
        time.sleep(3)

        # Wait for signup success message
        try:
            WebDriverWait(driver, 10).until(EC.url_matches("/sign-up/verify-email-address"))
        except Exception as e:
            self.fail(f"Signup failed or timed out: {e}")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
