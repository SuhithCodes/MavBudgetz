import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

class DeleteIncomeTest(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.get("http://localhost:3000")
        time.sleep(1.5)

    def test_delete_income(self):
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
        income_name = "Freelance"
        income_amount = "20000.00"

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

        # to click on the expense category 1 (salary) found
        category_1 = driver.find_element(By.XPATH, "/html/body/div[7]/div/div/div[2]/div/div/div/div/div/span[2]")
        category_1.click()
        
        time.sleep(3)

        # to click on the create expense found
        create_income_button = driver.find_element(By.XPATH, "/html/body/div[6]/div[2]/button[2]")
        create_income_button.click()
        
        time.sleep(3)

        # Navigate to the Transactions page
        transaction_url = "http://localhost:3000/transactions"
        driver.get(transaction_url)
        time.sleep(1)

        # Locate the delete button and click
        delete_income = driver.find_element(By.XPATH, "/html/body/div[1]/div[3]/div[2]/div/div[2]/div/table/tbody/tr/td[6]/button")
        delete_income.click()
        time.sleep(1)

        # Confirm delete
        delete_income_button = driver.find_element(By.XPATH, "/html/body/div[5]/div/div[3]")
        delete_income_button.click()
        time.sleep(1)

        confirm_button = driver.find_element(By.XPATH, "/html/body/div[6]/div[2]/button[2]")
        confirm_button.click()
        time.sleep(1)

        # Check the text returned by the specified XPath
        try:
            element = wait.until(EC.presence_of_element_located((By.XPATH, "/html/body/div[1]/div[3]/div[2]/div/div[2]/div/table/tbody/tr")))
            element_text = element.text
            # Verify if the required strings are present in the text
            self.assertNotIn("Freelance", element_text, "Salary found in the text")
            self.assertNotIn("$20,000.00", element_text, "$20,000.00 found in the text")
        except AssertionError as e:
            self.fail(f"AssertionError: {e}")
        except Exception as e:
            print("PASS: DELETE income")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
