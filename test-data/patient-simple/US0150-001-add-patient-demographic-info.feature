@featureid:US0150-001 @process:patientdatamanagement @ui
Feature: US0150-001 Add Patient Demographic Information

As a pharmacy team member
I want to capture patient demographic information 
So that I can create a patient 

  Background: Logged user 
    Given The user logged into the rx-ms application as pharmacy team member with 
  
      | username | password | 
      |          |          | 
  
  @jiraid: @smoke @auto
  Scenario: Navigation to Add Patient Demographic page 
  This is the generic scenario about accesibility of patient demographic page 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
      And The pharmacy team member navigates to demopgraphic patient page
     Then the demopgraphic patient page is shown with all required fields
  
   @basic @auto 
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
  
  @jiraid:RXRN-1138 @acceptance @auto
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
  
  @jiraid:RXRN-1139 @acceptance @auto
  Scenario: Register Patient - Verify that the system allows to change the prepopulated City and State for a Zip Code
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page
      And The pharmacy team member fills the Zip Code field with "12345" 
      And The pharmacy team member changes the prepopulated City and State fields with
  
      | city    | state | 
      | Chicago | IL    | 
  
     Then rx-ms system will allow to change the City and State fields
  
  @jiraid:RXRN-1088 @acceptance @auto
  Scenario: Register Patient - Verify that the system allow to enter the Phone Number
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page
      And The pharmacy team member fills the Phone Number field with "1234567890"
     Then rx-ms system will validate and format the inserted Phone Number 
  
  @jiraid:RXRN-1090 @basic @auto
  Scenario Outline: Register Patient - Verify that the system allows to insert a date of birth corresponding to a past date or a current date 
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page
      And The pharmacy team member fills the Date of Birth field with date <date> 
     Then rx-ms system will validate the inserted date
  
    Examples: 
  
      | date         | 
      | 01/01/1990   | 
      | current_date | 
  
  @jiraid:RXRN-1089 @acceptance @auto
  Scenario Outline: Register Patient - Verify that the system doesn't allow to insert a date of birth corresponding to a future date or an invalid format
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page
      And The pharmacy team member fills the Date of Birth field with date <date> 
     Then rx-ms system will display an error message  <errormessage>
  
    Examples: 
  
      | date       | errormessage           | 
      | xx/yy/zzzz | Invalid format         | 
      | 01/01/2050 | No future date allowed | 
  
  @jiraid:RXRN-1085 @acceptance @auto
  Scenario: Register Patient - Verify that the system allows to insert the Pet Species when the Pet Checkbox is ticked
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page 
      And The pharmacy team member inserts a patient as Pet with Pet Species 'dog'
     Then rx-ms system will allow to insert the Pet Species
  
  @jiraid:RXRN-1086 @acceptance @auto
  Scenario: Register Patient - Verify that the system allows to select one or more features of the patient
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page
      And The pharmacy team member selects one o more features
     Then rx-ms system will also allow to select multiple features
  
  @jiraid:RXRN-1087 @acceptance @auto 
  Scenario: Register Patient - Verify that the system doesn't allows to remove the phone number without remove all Alternative Phone Number
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page
      And The pharmacy team member inserts a Phone Number and an Alternative Phone Number
  
      | phone      | 
      | 1234567890 | 
      | 1234567891 | 
  
      And The pharmacy team member removes the Phone Number
     Then rx-ms system will not allow to remove the Phone Number 
  
  @jiraid:RXRN-1131 @acceptance @auto  
  Scenario: Register Patient - Verify that the system prepopulates the City and State associated to the inserted Zip Code 
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
      And an existing Zip Code "12345" linked to more cities 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page
      And The pharmacy team member fills Zip Code field with the existing Zip Code linked to more cities 
      And The pharmacy team member chooses one City and State related to the specified Zip Code
     Then rx-ms system will populate the City and State fields correctly 
  
  @jiraid:RXRN-1091 @acceptance @auto  
  Scenario: Register Patient - Verify that ,if multiple cities exist for the entered Zip Code,the system provides a list from which the User can choose one City and State
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
      And an existing Zip Code "12345" linked to more cities 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page
      And The pharmacy team member fill Zip Code field with the existing Zip Code linked to more cities 
     Then rx-ms system will display the list of multiple cities for the entered Zip Code 
  
  @jiraid:RXRN-1092 @acceptance @auto 
  Scenario Outline:Register Patient - Verify that the system doesn't allows the User to insert an invalid zip code 
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page 
      And The pharmacy team member fill Zip Code field with ZipCode <zipcode>
     Then rx-ms system will dispaly an error message
  
    Examples: 
  
      | zipcode | 
      | 1324    | 
      | 1234567 | 
      | 12abc   | 
  
  @jiraid:RXRN-1132 @acceptance @auto  
  Scenario: Register Patient - Verify that the system allows the pharmacy team member to close the 'Zip Code Select' pop-up
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
      And an existing Zip Code "12345" linked to more cities 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page 
      And The pharmacy team member fill Zip Code field with the existing Zip Code linked to more cities
      And The pharmacy team member don't choose a City and a State related to the specified Zip Code
     Then rx-ms system will not populate the City and State fields
  
  @jiraid:RXRN-1134 @acceptance @auto 
  Scenario: Register Patient - Verify that the system substitute Alternative Phone Number 1 for Alternative Phone Number 2 when the pharmacy team member deletes the Alternative Phone Number 1 
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page
      And The pharmacy team member insert a Phone Number and two Alternative Phone Number
  
      | phone      | 
      | 1234567890 | 
      | 1234567891 | 
      | 1234567892 | 
  
      And The pharmacy team member remove the Alternative Phone Number 1
     Then rx-ms system will substitute Alternative Phone Number 1 for Alternative Phone Number 2
  
  @jiraid:RXRN-1135 @acceptance @auto 
  Scenario: Register Patient - Verify that the system doesn't allow the User to insert the Alternative Phone Number without inserting the Phone Number 
    Given a not existing Patient with
      | name     | surname | dob        | phone       | 
      | Gianluca | Tommaso | 05/02/1978 | 34567364553 | 
     When The pharmacy team member is in the home page (dashboard) 
      And The pharmacy team member navigates to search patient page
      And The pharmacy team member performs a global patient search with the not existing patient data
      And The pharmacy team member navigates to demopgraphic patient page
      And The pharmacy team member insert a Alternative Phone Number
     Then rx-ms system will display an error message
