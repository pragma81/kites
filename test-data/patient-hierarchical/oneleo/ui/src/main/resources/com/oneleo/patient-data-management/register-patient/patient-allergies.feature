@featureid=uss-009 @ui
Feature: Patient Allergies
  Scenario: Add allergies to existing patient
    Given: I am logged within the system as doctor
      And: I am on the patient search page
     When: I insert <name> within the name filter field
      |name   |
      | Davide |
     Then: the system returns all the patients who has <name> as first name
  
  @auto @smoke @acceptance
  Scenario: Search with name and surname patient filter fields
    Given: I am logged within the system as doctor
      And: I am on the patient search page
     When: I insert <name> and <surname> within the name filter field
      |name   |
      | Davide |
     Then: the system returns only one patient who has <name> as first name and <surname> as surname
