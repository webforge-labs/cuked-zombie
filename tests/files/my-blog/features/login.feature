Feature: login
  In order to manage the the blog
  As a blog admin
  I need to login

  Scenario: using the login form
    When I goto the login form
    And I fill in "admin" as username
    And I fill in "secret" as password
    And I click on the "login" button
    Then I see the dashboard, logged in as "admin"
