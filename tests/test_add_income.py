import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

class AddIncomeTest(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.get("http://localhost:3000")
        time.sleep(1.5)

    def test_add_income(self):
        driver = self.driver
        wait = WebDriverWait(driver, 10)
        
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
        
        # Fill out the income form
        income_name = "Salary"
        income_amount = "3000.00"

        # Click on "New Income" button
        add_income_button = driver.find_element(By.XPATH, "/html/body/div[1]/div[3]/div/div[1]/div/div/button[1]")
        add_income_button.click()
        
        time.sleep(3)

        # to click on description field
        income_description_field = driver.find_element(By.XPATH, "/html/body/div[6]/form/div[1]/input")
        income_description_field.click()
        income_description_field.send_keys(income_name)
        
        time.sleep(3)

        # to click on input field
        income_amount_field = driver.find_element(By.XPATH, "/html/body/div[6]/form/div[2]/input")
        income_amount_field.click()
        income_amount_field.send_keys(income_amount)
        
        time.sleep(3)

        # to click on the element(Select category) found
        income_category_field = driver.find_element(By.XPATH, "/html/body/div[6]/form/div[3]/div[1]/button")
        income_category_field.click()
        
        time.sleep(3)

        # to click on the income category 1 (salary) found
        category_1 = driver.find_element(By.XPATH, "/html/body/div[7]/div/div/div[2]/div/div/div/div/div/span[2]")
        category_1.click()
        
        time.sleep(3)

        # to click on the create income
        create_income_button = driver.find_element(By.XPATH, "/html/body/div[6]/div[2]/button[2]")
        create_income_button.click()
        
        time.sleep(3)

        # Navigate to the Transactions page
        transaction_url = "http://localhost:3000/transactions"
        driver.get(transaction_url)
        time.sleep(1)

        # Check the text returned by the specified XPath
        try:
            element = wait.until(EC.presence_of_element_located((By.XPATH, "/html/body/div[1]/div[3]/div[2]/div/div[2]/div/table/tbody/tr")))
            element_text = element.text
            # Verify if the required strings are present in the text
            self.assertIn("Salary", element_text, "Salary not found in the text")
            self.assertIn("$3,000.00", element_text, "$3,000.00 not found in the text")
        except Exception as e:
            self.fail(f"AssertionError: {e}")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
