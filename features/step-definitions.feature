Feature: step-definitions
  In order to have distributed step step-definitions
  as a developer
  I can use cuked zombie to help me

  Background:
    Given I am using the project "my-blog"
    And I have installed cuked-zombie with npm
    And I have created my step-definition bootstrap by hand

  Scenario: Running distributed step definitions with grunt
    When I execute the grunt cucumber task with filter "post" in the root of the project
    Then cucumber has run the feature "post" successfully
    And all cucumber tests are passed

  Scenario: Running with tags option
    When I execute the grunt cucumber task with tag "@post" in the root of the project
    Then cucumber has run the feature "post" successfully
    And all cucumber tests are passed
