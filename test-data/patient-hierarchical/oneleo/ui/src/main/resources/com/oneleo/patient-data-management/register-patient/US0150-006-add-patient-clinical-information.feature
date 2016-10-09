 @featureid=US0150-006 @process=BPA002_Patient @ui
Feature: US0150-003 Add Patient Clinical Information

As a pharmacy team member
I want to capture patient clinical information
So that I can create a patient

  Background: Logged user 
    Given The user logged into the rx-ms application as pharmacy team user with username <username> and password <password>
      | username | password | 
      | Admin    | changeme | 
  
  @jiraid=RXRN-1143 @acceptance @auto 
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
  #  @jiraid=RXRN-1144 @acceptance @auto
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
  
  @jiraid=RXRN-1148 @acceptance @auto
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
  
  @jiraid=RXRN-1149 @acceptance @auto
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
  @jiraid=RXRN-1150 @acceptance @auto
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
  
  