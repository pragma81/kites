@featureid=US0150-003 @process:BPA002_Patient @ui
Feature: US0150-003 Add Patient Clinical Information

As a pharmacy team member
I want to capture patient clinical information
So that I can create a patient

  Background: Logged user 
    Given The user logged into the rx-ms application as pharmacy team user with username <username> and password <password>
      | username | password | 
      | Admin    | changeme | 
  
  @jiraid=RXRN-1143 @acceptance @auto 
  Scenario: Register Patient - Verify that, in the 'Allergies & Health Conditions' page, the system populates the date and time in 'Allergies' section when a new allergy is entered
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds a patient allergy
     Then rx-ms system populated date and time correctly 
  