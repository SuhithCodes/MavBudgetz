import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup
import time
import re

class ValidateTransactionsDashboardTest(unittest.TestCase):

    def setUp(self):
        self.driver = webdriver.Chrome()
        self.driver.get("http://localhost:3000")
        time.sleep(5)

    def test_validate_transactions_dashboard(self):
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

        # Navigate to the Transactions page
        transaction_url = "http://localhost:3000/transactions"
        driver.get(transaction_url)
        time.sleep(2)

        # Locate the element by XPath
        element = driver.find_element(By.XPATH, '/html/body/div[1]/div[3]/div[2]/div/div[2]/div/table/tbody')

        # Get the HTML content of the element
        html_content = element.get_attribute('outerHTML')

        # Use BeautifulSoup to parse the HTML content
        soup = BeautifulSoup(html_content, 'html.parser')

        # Extract all text within the element
        text_content = soup.get_text(separator='\n')

        # Split the text into lines
        lines = text_content.split('\n')

        # Initialize variables to hold total income and expenses
        total_income = 0.0
        total_expense = 0.0

        # Regex pattern to extract monetary values
        money_pattern = re.compile(r'\$([\d,]+\.\d{2})')

        # Process the lines to calculate income and expenses
        for i in range(len(lines)):
            if 'income' in lines[i].lower():
                match = money_pattern.search(lines[i + 1])
                if match:
                    total_income += float(match.group(1).replace(',', ''))
            elif 'expense' in lines[i].lower():
                match = money_pattern.search(lines[i + 1])
                if match:
                    total_expense += float(match.group(1).replace(',', ''))

        # Calculate net total
        net_total = total_income - total_expense

        # Open the dashboard webpage
        dashboard_url = "http://localhost:3000"
        driver.get(dashboard_url)
        time.sleep(3)

        # Locate the element using XPath and retrieve the text
        element = driver.find_element(By.XPATH, '/html/body/div[1]/div[3]/div/div[3]/div[1]')
        text = element.text

        # Split the text into lines and parse the values
        lines = text.split('\n')
        income = lines[1].replace('$', '').replace(',', '')
        expense = lines[3].replace('$', '').replace(',', '')
        balance = lines[5].replace('$', '').replace(',', '')

        # Convert the values to float for further processing if needed
        dashboard_income = float(income)
        dashboard_expense = float(expense)
        dashboard_balance = float(balance)

        # Compare the values and print the results
        self.assertEqual(total_income, dashboard_income, "Total income does NOT match the dashboard income.")
        self.assertEqual(total_expense, dashboard_expense, "Total expense does NOT match the dashboard expense.")
        self.assertEqual(net_total, dashboard_balance, "Net total does NOT match the dashboard balance.")

    def tearDown(self):
        self.driver.quit()

if __name__ == "__main__":
    unittest.main()
