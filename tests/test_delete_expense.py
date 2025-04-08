import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time

class TestDeleteExpense(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.get("http://localhost:3000")
        time.sleep(1.5)

    def test_delete_expense(self):
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
        expense_name = "Goods"
        expense_amount = "250.00"

        # Click on "New Expense" button
        add_expense_button = driver.find_element(By.XPATH, "/html/body/div[1]/div[3]/div/div[1]/div/div/button[2]")
        add_expense_button.click()
        
        time.sleep(3)

        # to click on description field
        expense_description_field = driver.find_element(By.XPATH, "/html/body/div[6]/form/div[1]/input")
        expense_description_field.click()
        expense_description_field.send_keys(expense_name)
        
        time.sleep(3)

        # to click on input field
        expense_amount_field = driver.find_element(By.XPATH, "/html/body/div[6]/form/div[2]/input")
        expense_amount_field.click()
        expense_amount_field.send_keys(expense_amount)
        
        time.sleep(3)

        # to click on the element(Select category) found
        expense_category_field = driver.find_element(By.XPATH, "/html/body/div[6]/form/div[3]/div[1]/button")
        expense_category_field.click()
        
        time.sleep(3)

        # to click on the expense category 1 (groceries) found
        category_1 = driver.find_element(By.XPATH, "/html/body/div[7]/div/div/div[2]/div/div/div/div/div/span[2]")
        category_1.click()
        
        time.sleep(3)

        # to click on the create expense
        create_expense_button = driver.find_element(By.XPATH, "/html/body/div[6]/div[2]/button[2]")
        create_expense_button.click()
        
        time.sleep(3)

        # to click on the element(Transactions) found
        trasaction_url = "http://localhost:3000/transactions"
        driver.get(trasaction_url)
        time.sleep(5)
        
        # Click ... to open dropdown
        dropdown = driver.find_element(By.XPATH, "/html/body/div[1]/div[3]/div[2]/div/div[2]/div/table/tbody/tr[1]/td[6]/button")
        dropdown.click()
        
        time.sleep(3)
        
        # Click delete from dropdown
        delete = driver.find_element(By.XPATH, "/html/body/div[5]/div/div[3]")
        delete.click()
        
        time.sleep(3)
        
        # Click confirm delete
        confirm_delete = driver.find_element(By.XPATH, "/html/body/div[6]/div[2]/button[2]")
        confirm_delete.click()
        
        time.sleep(3)

        # Check the text returned by the specified XPath
        try:
            element = wait.until(EC.presence_of_element_located((By.XPATH, "/html/body/div[1]/div[3]/div[2]/div/div[2]/div/table/tbody/tr[1]")))
            element_text = element.text
            # Verify if the required strings are present in the text
            self.assertNotIn(expense_name, element_text, "Goods found in the text")
            self.assertNotIn(expense_amount, element_text, "$250.00 found in the text")
        except AssertionError as e:
            self.fail(f"AssertionError: {e}")
        except Exception as e:
            self.fail(f"Failed to find the element or retrieve the text: {e}")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
