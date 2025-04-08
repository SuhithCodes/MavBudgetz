import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class TestInvalidExpense(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.get("http://localhost:3000")
        time.sleep(1.5)

    def test_invalid_expense(self):
        driver = self.driver
        wait = WebDriverWait(driver, 10)
        
        # Fill out the login form with correct credentials
        username = "kxr0701@mavs.uta.edu"
        password = "clerkclerkp"

        username_field = self.driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div/div/div[1]/div[2]/form/div/div[1]/div/div[1]/input")
        username_field.send_keys(username)
        username_field.send_keys(Keys.RETURN)
        time.sleep(3)

        password_field = self.driver.find_element(By.XPATH, "/html/body/div[1]/div/div[2]/div/div/div[1]/div[2]/form/div/div/div[1]/div[2]/input")
        password_field.send_keys(password)
        password_field.send_keys(Keys.RETURN)
        time.sleep(3)

        # Fill out the expense form
        expense_name = ""
        expense_amount = "abs"

        # Click on "New Expense" button
        add_expense_button = driver.find_element(By.XPATH, "/html/body/div[1]/div[3]/div/div[1]/div/div/button[2]")
        add_expense_button.click()
        
        time.sleep(3)

        # to click on description field
        expense_description_field = driver.find_element(By.XPATH, "/html/body/div[6]/form/div[1]/input")
        expense_description_field.click()
        expense_description_field.send_keys(expense_name)
        
        time.sleep(3)
        
        # to click on the create expense
        create_expense_button = driver.find_element(By.XPATH, "/html/body/div[6]/div[2]/button[2]")
        create_expense_button.click()
        
        time.sleep(3)

        # Check if it s highlighted in red to notify as required
        expense_amount_field = driver.find_element(By.XPATH, "/html/body/div[6]/form/div[2]/label")
        class_name = expense_amount_field.get_attribute("class")
        expected_class_name = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-destructive"
        
        time.sleep(3)

        # Check the text returned by the specified XPath
        try:
            self.assertEqual(class_name, expected_class_name, f"Class name mismatch: expected '{expected_class_name}', got '{class_name}'")
        except Exception as e:
            self.fail(f"Failed to find the element or validate the class name: {e}")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
