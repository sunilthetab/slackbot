package selenium.tests;
import static org.junit.Assert.assertNotNull;
import org.junit.AfterClass;
import org.junit.BeforeClass;
import org.junit.Test;
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import io.github.bonigarcia.wdm.ChromeDriverManager;

public class SlackTest {
private static WebDriver driver;
WebDriverWait wait = new WebDriverWait(driver, 30);

	@BeforeClass
	public static void setUp() throws Exception 
	{
		//driver = new HtmlUnitDriver();
		ChromeDriverManager.getInstance().setup();
		driver = new ChromeDriver();
	}
	
	@AfterClass
	public static void  tearDown() throws Exception
	{
		driver.close();
		driver.quit();
	}

	
	@Test

	public void postMessage() throws InterruptedException{

	driver.get("https://seprojbot.slack.com/");

	WebDriverWait wait = new WebDriverWait(driver, 30);

	wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("signin_btn")));

	WebElement email = driver.findElement(By.id("email"));

	WebElement pw = driver.findElement(By.id("password"));

	email.sendKeys("azrabot@hotmail.com");

	pw.sendKeys("Qwerty123abc");

	WebElement signin = driver.findElement(By.id("signin_btn"));

	signin.click();

	wait.until(ExpectedConditions.titleContains("general"));

	driver.get("https://seprojbot.slack.com/messages/azra_testing");

	wait.until(ExpectedConditions.titleContains("azra_testing"));

	// Type something 

	WebElement messageBot = driver.findElement(By.id("message-input"));

	messageBot.sendKeys("@azra setup");

	messageBot.sendKeys(Keys.RETURN);

	wait.withTimeout(10, TimeUnit.SECONDS).ignoring(StaleElementReferenceException.class);

	WebElement msg = driver.findElement(

	By.xpath("//span[contains(@class,'message_body') and text() = 'Alright. May I know the email IDs of the attendees, please?']"));


	assertNotNull(msg);

	Thread.sleep(2000);

	wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//span[contains(@class,'message_body') and text() = 'Alright. May I know the email IDs of the attendees, please?']")));

	WebElement messageBot1 = driver.findElement(By.id("message-input"));

	messageBot1.sendKeys("@azra pranav,sohan,gautam,sunil,ajay");



	messageBot1.sendKeys(Keys.RETURN);

	wait.withTimeout(10, TimeUnit.SECONDS).ignoring(StaleElementReferenceException.class);

	WebElement msg1 = driver.findElement(

	By.xpath("//span[contains(@class,'message_body') and text() = 'OK. What will be the approximate duration of the meeting (HH:MM or HH)?']"));

	wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//span[contains(@class,'message_body') and text() = 'OK. What will be the approximate duration of the meeting (HH:MM or HH)?']")));

	assertNotNull(msg1);

	Thread.sleep(2000);

	WebElement messageBot2 = driver.findElement(By.id("message-input"));

	messageBot2.sendKeys("@azra 2");

	messageBot2.sendKeys(Keys.RETURN);

	wait.withTimeout(10, TimeUnit.SECONDS).ignoring(StaleElementReferenceException.class);

	WebElement msg2 = driver.findElement(By.xpath("//span[@class='message_body' and text() = 'And by what date(MM/DD/YYYY or MM/DD or DD) or day do you want the meeting to be scheduled? Say NA if no such constraint']"));

	assertNotNull(msg2);

	Thread.sleep(2000);

	WebElement messageBot4 = driver.findElement(By.id("message-input"));

	messageBot4.sendKeys("@azra 10/26");

	messageBot4.sendKeys(Keys.RETURN);

	WebElement msg4 = driver.findElement(By.xpath("//span[@class='message_body' and text() = 'OK. By what time (HH:MM or HH) should the meeting be organized (24 Hour format)? Say NA if no such constraint']"));

	assertNotNull(msg4);

	Thread.sleep(2000);

	WebElement messageBot5 = driver.findElement(By.id("message-input"));

	messageBot5.sendKeys("@azra 17");

	messageBot5.sendKeys(Keys.RETURN);

	WebElement msg5 = driver.findElement(By.xpath("//*[contains(text(),'Do you want to fix this meeting time? Please reply Yes or No')]"));

	        //wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//span[contains(@class,'message_body') and text() ='Do you want to fix this meeting time? Please reply Yes or No']")));

	assertNotNull(msg5);

	Thread.sleep(2000);

	WebElement messageBot6 = driver.findElement(By.id("message-input"));

	messageBot6.sendKeys("@azra yes");

	messageBot6.sendKeys(Keys.RETURN);

	WebElement msg6 = driver.findElement(By.xpath("//*[contains(text(),'This is your meeting')]"));

	assertNotNull(msg6);

	Thread.sleep(2000);



	}
	
	@Test
	public void cancelMeeting() throws InterruptedException
	{
		driver.get("https://seprojbot.slack.com/");

		// Wait until page loads and we can see a sign in button.
		WebDriverWait wait = new WebDriverWait(driver, 30);
		wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("signin_btn")));

		// Find email and password fields.
		WebElement email = driver.findElement(By.id("email"));
		WebElement pw = driver.findElement(By.id("password"));

		// Type in our test user login info.
		email.sendKeys("azrabot@hotmail.com");
		pw.sendKeys("Qwerty123abc");

		// Click
		WebElement signin = driver.findElement(By.id("signin_btn"));
		signin.click();

		// Wait until we go to general channel.
		wait.until(ExpectedConditions.titleContains("general"));

		// Switch to #bots channel and wait for it to load.
		driver.get("https://seprojbot.slack.com/messages/azra_testing");
		wait.until(ExpectedConditions.titleContains("azra_testing"));
		
		
		WebElement messageBot = driver.findElement(By.id("message-input"));
		messageBot.sendKeys("@azra cancel");
		messageBot.sendKeys(Keys.RETURN);
		Thread.sleep(6000);
		
		WebElement msg = driver.findElement(By.xpath("//span[contains(@class,'message_body') and text() = 'May I know the meeting ID?']"));
		//wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//span[contains(@class,'message_body') and text() = 'May I know the meeting ID?']")));
		assertNotNull(msg);
		
		messageBot.sendKeys("102");
		messageBot.sendKeys(Keys.RETURN);
		Thread.sleep(6000);
		WebElement msg1 = driver.findElement(By.xpath("//span[contains(@class,'message_body') and text() = 'Are you sure you want to cancel the meeting?']"));
		//wait.until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//span[contains(@class,'message_body') and text() = 'Are you sure you want to cancel the meeting?']")));
		assertNotNull(msg1);
		
		
		messageBot.sendKeys("yes");
		messageBot.sendKeys(Keys.RETURN);
		Thread.sleep(6000);
		WebElement msg2 = driver.findElement(By.xpath("//span[contains(@class,'message_body') and text() = 'Meeting has been cancelled.']"));
                assertNotNull(msg2);
		
		
		
		
		
		
		
	}
	

	}


