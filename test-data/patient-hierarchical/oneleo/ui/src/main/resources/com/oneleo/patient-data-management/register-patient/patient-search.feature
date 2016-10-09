@featureid=uss-007 @ui
Feature: Patient Search
  
  Background: User Logged
        When: I Logged in the with <name> and <surname>
        And: I navigate to patient search page
        
  
  Scenario: Search with minimum patient filter fields
    Given: I am logged within the system as doctor
      And: I am on the patient search page
     When: I insert <name> within the name filter field
      |name   |
      | Davide |
     Then: the system returns all the patients who has <name> as first name
  
  @auto @basic
  Scenario: Search with name and surname patient filter fields
    Given: I am logged within the system as doctor
      And: I am on the patient search page
     When: I insert <name> and <surname> within the name filter field
      |name   |
      | Davide |
     Then: the system returns only one patient who has <name> as first name and <surname> as surname
