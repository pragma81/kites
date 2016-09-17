@featureid:US0150-003 @process:BPA002_Patient @ui
Feature: US0150-003 Add Patient Clinical Information

As a pharmacy team member
I want to capture patient clinical information
So that I can create a patient

  Background: Logged user 
    Given The user logged into the rx-ms application as pharmacy team user with username <username> and password <password>
      | username | password | 
      | Admin    | changeme | 
  
  @jiraid:RXRN-1143 @acceptance @auto 
  # RXAPPD-1049 Register Patient - Timestamp in Allergies with add new allergy
  Scenario: Register Patient - Verify that, in the 'Allergies & Health Conditions' page, the system populates the date and time in 'Allergies' 
  section when a new allergy is entered
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds a patient allergy
     Then rx-ms system populated date and time correctly 
  
  # scenario da US update patient clinical info  
  #  @jiraid:RXRN-1144 @acceptance @auto
  #  # RXAPPD-1050 Register Patient - Delete all the Clinical information associated to a patient and discard
  #  Scenario: Register Patient - Verify that, when the User selects 'Add/Update Allergies & Health Conditions' from the "Patient profile" page 
  #  of an exsisting patient and deletes all the existing Clinical Informations, the System alerts the user they have no Clinical Information 
  #  to add and returns the user to the 'Allergies and Health Conditions' overlay if the user does NOT confirm
  #    Given An existing Patient with
  #      | name     | surname | dob        | phone      | 
  #      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
  #     And with at least one Clinical Information associated
  #     When the pharmacy team user removes all existing Clinical Information
  #      And does not save information
  #     Then rx-ms system alerts that have no Clinical Information
  
  # scenario da US update patient clinical info
  #@jiraid:RXRN-1145 @acceptance @auto
  #  #RXAPPD-1053 Register Patient - Delete all the Clinical information associated to a patient and confirm
  #  Scenario: Register Patient - Verify that, when the User selects 'Add/Update Allergies & Health Conditions' from the "Patient profile" page 
  #  of an exsisting patient and deletes all the existing Clinical Informations, the System alerts the user they have no Clinical Information 
  #  to add and defaults the radio button to "Confirm with Patient" in the 'General Info' screen if the user confirm
  #    Given An existing Patient with
  #      | name     | surname | dob        | phone      | 
  #      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
  #      And with at least one Clinical Information associated
  #     When the pharmacy team user removes all existing Clinical Information
  #      And save information
  #     Then rx-ms system alerts that have no Clinical Information
  
  # In attesa di info dal team responsabile della feature, incongruenza Then
  #    @jiraid:RXRN-1146 @acceptance @auto
  #	#RXAPPD-1056 Register Patient - Remove Common Health Conditions from 'Health Conditions' section
  #	Scenario: Register Patient - Verify that, in the 'Allergies & Health Conditions' page, the system allows to remove the Common Health Conditions 
  # from Health Conditions section  
  #    Given  An existing Patient with
  #		| name     | surname | dob        | phone       | 
  #		| Gianluca | Tommaso | 05/02/1978 | 3334567899 |
  #	And without a Clinical Information associated        
  #     When the specific user remove a Common Health Conditions
  #     Then 
  
  @jiraid:RXRN-1148 @acceptance @auto
  #RXAPPD-1059 Register Patient - Add common Allergies and Timestamp in Allergies & Healts Conditions
  Scenario: Register Patient - Verify that, in the 'Allergies & Health Conditions' page, the system allows to add common allergies
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds more common allergies
     Then rx-ms system populated the common allergies correctly 
  
  @jiraid:RXRN-1149 @acceptance @auto
  #RXAPPD-1061 Register Patient - Associate Reactions and Timestamp to Common Allergy in Allergies & Health Conditions
  Scenario: Register Patient - Verify that, in the 'Allergies & Health Conditions' page, the system allows to associate reactions to the Common Allergies
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds a Common Allergies
      And adds more than a Reactions
     Then rx-ms system inserts correctly data
  
  # In attesa di info dal team responsabile della feature, incongruenza, o si modifica il Given, specificando che esiste già una Health Condition
  # o aggiungere uno step che indichi l'aggiunta di una Health Condition
  @jiraid:RXRN-1150 @acceptance @auto
  #RXAPPD-1062 Register Patient - Remove Allergies and related reactions from the list in 'Allergies' section
  Scenario: Register Patient - Verify that, in the 'Allergies & Health Conditions' page, the system allows to remove the Common Allergies 
  from the list with the <-> button but at least one health condition remain associated to the patient
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds more Common Allergies
      And removes all but one Common Allergies
     Then rx-ms system correctly removed
  
  # In attesa di info dal team responsabile della feature, incongruenza, o si modifica il Given, specificando che esiste già una Health Condition
  # o aggiungere uno step che indichi l'aggiunta di una Health Condition
  @jiraid:RXRN-1151 @acceptance @auto
  #RXAPPD-1064 Register Patient - Remove Common Allergy and related reactions from 'Allergies ' section
  Scenario: Register Patient - Verify that, in the 'Allergies & Health Conditions' page, the system allows to remove the Common Allergies and
  related reactions from 'Allergies' section
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds a Common Allergies 
      And adds Reactions
      And removes a Common Allergies and relative Reactions
     Then rx-ms system correctly removed
  
  @jiraid:RXRN-1152 @acceptance @auto
  #RXAPPD-1067 Register Patient - <Cancel> Button on initial add of Allergies & Health Conditions
  Scenario: Register Patient - Verify that, in the 'Allergies & Health Conditions' page, 
  the system allows to clear all the information entered on initial add
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds a Common Allergies
      And Cancel operation
     Then rx-ms system requires confirmation and performs tasks and deletes information
  
  @jiraid:RXRN-1153 @acceptance @auto
  #RXAPPD-1071 Register Patient - Close cancel confirmation pop up of Allergies & Health Conditions
  Scenario: Register Patient - Verify that, in the 'Allergies & Health Conditions' page, the system allows to close the cancel confirmation pop up
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds a Common Allergies
      And Cancel operation
     Then rx-ms system requires confirmation and performs tasks and not deletes information
  
  @jiraid:RXRN-1154 @acceptance @auto
  #RXAPPD-1073 Register Patient - Save button with Allergies & Health Condition added
  Scenario: Register Patient - Verify that, in the 'Allergies & Health Conditions' page, the system allows to save Clinical Information when
  the user adds at least an allergy with related reactions or an Health conditions
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds a Common Allergies with a Reaction
      And adds Health Conditions
     Then the Clinical Information are added correctly 
  
  @jiraid:RXRN-1155 @acceptance @auto
  #RXAPPD-1075 Register Patient - <Save> button without Allergies & Health Condition
  Scenario: Register Patient - Verify that, in the 'Allergies & Health Conditions' page, the system allows to save Clinical Information when 
  the user clears all fields
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds a Common Allergies with a Reaction
      And stores information
      And removes a Common Allergies with a Reaction
      And adds Health Conditions
      And stores information
      And removes a Health Condition
     Then rx-ms system warnings that no clinical info to add
  
  @jiraid:RXRN-1156 @acceptance @auto
  #RXAPPD-1076 Register Patient - Sort Allergies and Health Conditions in 'General Info'
  Scenario: Register Patient - Verify that, in the 'General Info' page, the system displays the Allergies & Health Conditions 
  ordered by last updated date and time
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds more Common Allergies with releted reactions
      And  adds more Health Condition
     Then the Clinical Information are added correctly and in General Info page displayed in order by last updated
  
  @jiraid:RXRN-1157 @acceptance @auto
  #RXAPPD-1077 Register Patient - Sort Allergies and Health Conditions in 'Allergies and Health Conditions' screen
  Scenario: Register Patient - Verify that, in the 'Allergies and Health Conditions' screen, the system displays the Allergies & Health Conditions 
  ordered by last updated date and time
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds more Common Allergies with releted reactions
      And  adds more Health Condition
     Then the Clinical Information are added correctly and in Allergies and Health Conditions screen displayed in order by last updated
  
  @jiraid:RXRN-1158 @acceptance @auto
  #RXAPPD-1081 Register Patient - Configurated number of common allergies load into screen
  Scenario: Register Patient - Verify that, in the 'Allergies and Health Conditions' screen, the system displays 
  configurated number of common allergies load into screen (min value 1 ; max value 15 ; default value 10 )
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
      And with number of displayable Common Allergies
      | numOfAllergies | 
      | 6              | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates into Allergies & Healt Conditions page	
     Then rx-ms system displayed the correct number of Common Allergy
  
  @jiraid:RXRN-1159 @acceptance @auto
  #RXAPPD-1084 Register Patient - Configurated number of Common Health Conditions load into screen
  Scenario: Register Patient - Verify that, in the 'Allergies and Health Conditions' screen, the system displays 
  configurated number of Common Health Conditions load into screen (min value 1 ; max value 15 ; default value 10 )
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
      And with number of displayable Health Condition
      | numOfHC | 
      | 6       | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates into Allergies & Healt Conditions page	
     Then rx-ms system displayed the correct number of Health Condition
  
  @jiraid:RXRN-1160 @acceptance @auto
  #RXAPPD-1085 Register Patient - Configurated number of Reaction load into screen
  Scenario: Register Patient - Verify that, in the 'Allergies and Health Conditions' screen, the system displays 
  configurated number of Reaction Conditions load into screen (min value 1 ; max value 15 ; default value 10 )
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
      And with number of displayable Reaction Conditions
      | numOfReactionCondition | 
      | 6                      | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates into Allergies & Healt Conditions page	
     Then rx-ms system displayed the correct number of Reaction Condition
  
  @jiraid:RXRN-1161 @acceptance @auto
  #RXAPPD-1086 Register Patient - 'Confirm with Patient' set by default without allergies or health conditions
  Scenario: Register Patient - Verify that, in the 'General Info' screen, the system displays 'Confirm with Patient' radio button set by default 
  without allergies or healt conditions
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
     Then rx-ms system displayed the correct default value on Allergies Health Conditions
  
  @jiraid:RXRN-1162 @acceptance @auto
  #RXAPPD-1090 Register Patient - Enter in Allergies & Health Conditions screen
  Scenario: Register Patient - Verify that, in the 'General Info' screen, the system allows to enter in Allergies & Health Conditions screen 
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And wants to add a new Clinical Information
     Then rx-ms system displayed the Allergies Health Conditions screen
  
  @jiraid:RXRN-1163 @acceptance @auto
  #RXAPPD-1095 Register Patient - Search for Allergies by allergy name in Allergy & Health Conditions by 'Begin With' Criteria
  Scenario: Register Patient - Verify that, in the 'Allergy & Health Conditions' screen, the system allows to Search Allergy by allergy name 
  by Begin With criteria after the inserting of the third character
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And searchs Allergy by allergy name 
     Then rx-ms system displayed the list of Allergies
  
  @jiraid:RXRN-1164 @acceptance @auto
  #RXAPPD-1098 Register Patient - Search for a Health Conditions by 'Begin With' Criteria
  Scenario: Register Patient - Verify that, in the 'Allergies & Health Conditions' screen, the system allows to search for a Health Conditions
  by 'Begin With' Criteria
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And searchs Health Condition by health condition name 
     Then rx-ms system displayed the list of Health Condition
  
  @jiraid:RXRN-1165 @acceptance @auto
  #RXAPPD-1101 Register Patient - Add Health Conditions and Timestamp in Allergies & Healts Conditions
  Scenario: Register Patient - Verify that, in the 'Allergies & Healts Conditions' page, the system allows to add Healts Conditions
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds more than Health Condition 
     Then rx-ms system displayed the list of Health Condition
  
  @jiraid:RXRN-1166 @acceptance @auto
  #RXAPPD-1102 Register Patient - Due Date for Pregnant Health Condition
  Scenario: Register Patient - Verify that, in the 'Allergies & Healts Conditions' page, the system allows to add Due Date 
  for Pregnant Health Condition when Pregnant is selected
    Given An not existing Patient with
      | name | surname | dob        | phone      | 
      | Sara | Tommasi | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And adds pregnant Health Condition with Due Date
     Then the Clinical Information are added correctly
  
  @jiraid:RXRN-1168 @acceptance @auto
  #RXAPPD-1113 Register Patient - Search for Allergy by allergy name in Allergy & Health Conditions with less than 3 characters - FAILURE
  Scenario: Register Patient - Verify that, in the 'Allergy & Health Conditions' screen, the system doesn't allow to search Allergy by allergy name 
  with less than 3 characters
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And searches an Allergy with less than 3 characters
     Then rx-ms system doesn't search the Allergies
  
  @jiraid:RXRN-1169 @acceptance @auto
  #RXAPPD-1113
  Scenario: 
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page	
      And searches an Health Condition with less than 3 characters
     Then rx-ms system doesn't search the Health Condition
  
  @jiraid:RXRN-1171 @acceptance @auto
  #RXAPPD-1151 Register Patient - Cancel Button after initial add of Allergies & Health Conditions
  Scenario: Register Patient - Verify that, in the 'Allergies & Healt Conditions' page,
  after initial add the system will be discarted only the changes done
    Given An not existing Patient with
      | name     | surname | dob        | phone      | 
      | Gianluca | Tommaso | 05/02/1978 | 3334567899 | 
     When the pharmacy team user is in the home page (dashboard)
      And navigates to search patient page
      And performs a global patient search with a not existing Patient data
      And navigates Allergies & Healt Conditions page
      And add a new Allergy
      And Save information
      And  navigates Allergies & Healt Conditions page
      And cancel a Common Allergy
     Then rx-ms system make the change
  
  
