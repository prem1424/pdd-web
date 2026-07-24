const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Configuration
const BASE_URL = 'http://localhost:3000';
const TIMEOUT = 10000; // 10s timeout

async function runTests() {
    // Setup Chrome Options (headless mode can be enabled for CI)
    let options = new chrome.Options();
    options.addArguments('--disable-gpu');
    options.addArguments('--start-maximized');
    options.addArguments('--headless'); // Enable headless mode for automated execution
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');


    console.log('Initializing Chrome Driver...');
    let driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    try {
        console.log(`Navigating to ${BASE_URL}/#role-select...`);
        await driver.get(`${BASE_URL}/#role-select`);


        // 1. Wait for splash screen / redirect to role selection
        console.log('Waiting for Role Selection Screen...');
        await driver.wait(until.elementLocated(By.className('role-title')), TIMEOUT);
        let title = await driver.findElement(By.className('role-title')).getText();
        console.log(`Role title found: "${title}"`);

        // ==========================================
        // TEST CASE GROUP 1: AUDITOR ROLE TESTS
        // ==========================================
        console.log('\n--- Running Auditor UI Tests ---');
        // Navigate directly to Auditor login screen
        await driver.get(`${BASE_URL}/#auditor-login`);
        await driver.sleep(1500);


        // Wait for Auditor Login screen
        await driver.wait(until.elementLocated(By.id('aud-email')), TIMEOUT);
        console.log('Auditor Login Screen loaded successfully.');

        // Test empty submit warning
        let loginBtn = await driver.findElement(By.id('aud-login-btn'));
        await driver.executeScript("arguments[0].click();", loginBtn);
        console.log('Empty submit verification clicked.');

        // Toggle password visibility
        let eyeIcon = await driver.findElement(By.id('aud-eye'));
        let passwordInput = await driver.findElement(By.id('aud-pass'));
        console.log(`Initial password type: ${await passwordInput.getAttribute('type')}`);
        await driver.executeScript("arguments[0].click();", eyeIcon);
        console.log(`Toggled password type: ${await passwordInput.getAttribute('type')}`);
        await driver.executeScript("arguments[0].click();", eyeIcon); // toggle back

        // Navigate directly to Sign Up page
        await driver.get(`${BASE_URL}/#auditor-signup`);
        await driver.sleep(1500);
        await driver.wait(until.elementLocated(By.id('aud-reg-name')), TIMEOUT);
        console.log('Auditor Signup Screen loaded successfully.');

        // Fill out sign up form
        const testAuditorEmail = `test_audit_${Math.floor(Math.random() * 10000)}@smartstock.in`;
        await driver.findElement(By.id('aud-reg-name')).sendKeys('Test Auditor');
        await driver.findElement(By.id('aud-reg-empid')).sendKeys(`AUD-${Math.floor(Math.random() * 9000 + 1000)}`);
        await driver.findElement(By.id('aud-reg-email')).sendKeys(testAuditorEmail);
        await driver.findElement(By.id('aud-reg-pass')).sendKeys('Password123!');
        await driver.findElement(By.id('aud-reg-conf')).sendKeys('Password123!');
        
        let registerBtn = await driver.findElement(By.id('aud-reg-btn'));
        await driver.executeScript("arguments[0].click();", registerBtn);
        console.log('Submitted Auditor registration form.');

        // ==========================================
        // TEST CASE GROUP 2: STUDENT ROLE TESTS
        // ==========================================
        console.log('\n--- Running Student UI Tests ---');
        // Navigate directly to Student login screen
        await driver.get(`${BASE_URL}/#student-login`);
        await driver.sleep(1500);

        // Wait for Student Login screen
        await driver.wait(until.elementLocated(By.id('stu-roll')), TIMEOUT);
        console.log('Student Login Screen loaded successfully.');

        // Navigate directly to Student Register screen
        await driver.get(`${BASE_URL}/#student-signup`);
        await driver.sleep(1500);
        await driver.wait(until.elementLocated(By.id('stu-reg-name')), TIMEOUT);
        console.log('Student Signup Screen loaded successfully.');


        // Fill out student registration
        const testRollNo = `STU${Math.floor(100000 + Math.random() * 900000)}`;
        await driver.findElement(By.id('stu-reg-name')).sendKeys('Student Test User');
        await driver.findElement(By.id('stu-reg-roll')).sendKeys(testRollNo);
        await driver.findElement(By.id('stu-reg-dept')).sendKeys('Microbiology');
        await driver.findElement(By.id('stu-reg-email')).sendKeys(`student_${testRollNo}@smartstock.in`);
        await driver.findElement(By.id('stu-reg-pass')).sendKeys('password123');
        await driver.findElement(By.id('stu-reg-conf')).sendKeys('password123');
        
        let studentRegBtn = await driver.findElement(By.id('stu-reg-btn'));
        await driver.executeScript("arguments[0].click();", studentRegBtn);
        console.log('Submitted Student registration form.');

        // ==========================================
        // TEST CASE GROUP 3: FORGOT PASSWORD TESTS
        // ==========================================
        console.log('\n--- Running Password Reset Flow Tests ---');
        await driver.get(`${BASE_URL}/#forgot-password`);
        await driver.sleep(1500);
        await driver.wait(until.elementLocated(By.id('forgot-email')), TIMEOUT);
        console.log('Forgot Password page loaded successfully.');

        console.log('\nAll E2E UI path test executions completed successfully!');

    } catch (error) {
        console.error('An error occurred during test execution:', error);
    } finally {
        console.log('Closing browser driver...');
        await driver.quit();
    }
}

// Execute tests
runTests();
