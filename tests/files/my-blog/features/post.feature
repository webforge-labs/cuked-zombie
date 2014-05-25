Feature: post 
  In order to manage the posts in my blog
  As a blog admin
  I need to write a post

  Scenario: Writing a new post
    Given I am logged in as admin
    When I goto the "posts" admin page
    And I click on "create post"
    And I fill some details
    And I save the post
    Then the post is saved in the database

