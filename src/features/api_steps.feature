# language en

Feature: Api Steps
    Scenario: When a GET http request is executed
        Given i have a session called "request example"
        When i make a get request to "http://localhost:3002/api/example"
        Then i receive the response
        And response should have status code 200
        And response should have body "{\"how_to_use\": \"follow the steps\"}"