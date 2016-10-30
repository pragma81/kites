@featureid=US0150-002 @jiraid=RXRN-1098 @process:patientdatamanagement @ui
Feature: US0150-002 Add Patient Demographic Information

As a pharmacy team member
I want to capture patient demographic information 
So that I can create a patient

  Background: Logged user 
    Given The user logged into the rx-ms application as pharmacy team member with 
  
      | username | password | 
      |          |          | 
  
  @smoke @auto  @jiraid=RXRN-1211
  Scenario: Navigation to Add Patient Demographic page 
  This is the generic scenario about accesibility of patient demographic page 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
      And The pharmacy team member navigates to demopgraphic patient page
     Then the demopgraphic patient page is shown with all required fields
  
   @basic @auto  @jiraid=RXRN-1136
  Scenario: Register Patient - Verify that the system allows the pharmacy team member to create a Patient with all mandatory fields 
    Given a not existing Patient with
      | name     | surname | dob        | phone       | gender | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | M      | 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page
      And The pharmacy team member fills the Add Patient Demographic page with all mandatory fields of the not existing patient data
     Then rx-ms system  will confirm the operation with a success message
      And the patient data are stored correctly
  
  @acceptance @auto @jiraid=RXRN-1138
  Scenario Outline: Register Patient - Verify that the system doesn't allows the pharmacy team member to create a Patient without all mandatory fields filled
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page
      And The pharmacy team member fills the Add Patient Demographic page with FirstName "<name>" and LastName "<surname>" and date of birth "<dob>" and gender "<gender>" 
     Then rx-ms system will display an error message
      And the patient data are not stored 
  
    Examples: 
  
      | name     | surname | dob        | gender | 
      | Gianluca |         |            |        | 
      |          | Tommaso |            |        | 
      |          |         | 05/02/1978 |        | 
      |          |         |            | M      | 
      |          |         |            |        | 
  
  