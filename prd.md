# RideWise AI Product Requirements Document (PRD)

**Document version:** 1.0\
**Status:** MVP specification\
**Prepared:** 14 October 2026\
**Product:** RideWise AI\
**Tagline:** *Every ride needs a Plan B.*

------------------------------------------------------------------------

## 1. Executive Summary

RideWise AI is a ride-booking and recovery concept designed to help
riders make a dependable trip plan and respond when a booking cannot be
fulfilled. The product combines a conversational trip request experience
with booking management and a fallback workflow. If the originally
assigned driver cancels or a booking cannot be fulfilled, the system
attempts a recovery path and clearly communicates the resulting status.

The current implementation is a competition/demo MVP. It uses a Node.js
server, a browser-based frontend, local JSON persistence, illustrative
route and fare calculations, and a simulated driver fleet. It is not
connected to a real driver network or production mapping, payment,
identity, or notification services.

## 2. Problem Statement

Ride bookings can fail when a driver cancels, is unavailable, or cannot
complete the trip. Riders may be left uncertain about whether a
replacement is being found, whether the trip is still active, or what
action they should take next.

RideWise AI aims to make trip intent easy to express, booking status
understandable, and recovery behavior explicit. The product should never
imply that a replacement is confirmed unless the system has actually
assigned one.

## 3. Product Vision

**Vision:** Make ride planning more resilient by giving every booking a
clear status and a defined recovery path.

### 3.1 Product Principles

1.  **Clarity over false certainty:** communicate confirmed, pending,
    failed, and cancelled states distinctly.
2.  **Recovery is a first-class workflow:** handle driver cancellation
    and unfulfilled bookings as explicit product states.
3.  **AI assists, rules decide:** AI may help interpret trip requests,
    but validated business rules control booking state transitions.
4.  **Visible limitations:** demo or simulated data must not be
    presented as live operational data.
5.  **Useful failure states:** when no backup is available, explain the
    outcome and provide a clear next step.

## 4. Goals and Non-Goals

### 4.1 MVP Goals

-   Allow a rider to describe a trip in natural language or through
    structured trip details.
-   Convert trip intent into a reviewable trip summary.
-   Estimate a route and fare using clearly identified illustrative
    logic.
-   Create and display a booking with a trackable status.
-   Support a simulated driver assignment and driver lifecycle.
-   Handle driver cancellation through a recovery attempt.
-   Represent the case where no backup driver is available.
-   Provide customer-facing trip history and operational views for
    dispatch/driver workflows.
-   Persist demo data between server restarts using local JSON files.

### 4.2 Non-Goals for This MVP

-   Real-world driver dispatch or a verified supply network.
-   Live GPS tracking or production-grade route calculation.
-   Real payments, refunds, invoicing, or stored payment methods.
-   Production authentication, identity verification, or role-based
    access control.
-   SMS, push, email, or phone-call notifications.
-   Production-grade safety, emergency response, fraud prevention, or
    regulatory workflows.
-   Guaranteed replacement-driver availability or guaranteed pickup
    times.

## 5. Target Users and Personas

### 5.1 Rider

A person who wants to request a trip, understand its estimated cost and
status, and know what happens if the assigned driver cancels.

**Needs** - A simple way to describe a trip. - A reviewable origin,
destination, and fare estimate. - Clear booking status. - A transparent
recovery outcome if a booking fails.

### 5.2 Dispatcher / Operations User

A person who needs to inspect bookings and understand assignment,
cancellation, and recovery states in the demo environment.

**Needs** - A view of booking and driver status. - Visibility into
cancellation and recovery events. - A clear distinction between
simulated and real operational data.

### 5.3 Driver (Simulated in MVP)

A driver actor represented in the demo workflow, used to demonstrate
assignment and trip lifecycle changes.

**Needs** - A simple view of assigned work. - Clear actions to progress
or cancel a trip, where supported by the prototype. - Status changes
reflected consistently in the booking workflow.

## 6. Scope

### 6.1 In Scope

-   Natural-language trip parsing, with optional server-side OpenAI API
    support when configured.
-   Structured trip details and trip summary review.
-   Illustrative distance, duration, and fare estimates.
-   Booking creation and persistence.
-   Simulated driver fleet and assignment.
-   Booking lifecycle status changes.
-   Driver cancellation and backup/recovery attempt.
-   Explicit no-backup / unfulfilled outcome.
-   Customer trip list and dispatch/driver views.
-   Basic API and smoke-test coverage for core flows.

### 6.2 Out of Scope

All items listed under Non-Goals remain out of scope unless added
through a future approved product decision.

## 7. Core User Journeys

### Journey A: Create a Booking

1.  Rider enters a trip request in natural language or structured
    fields.
2.  System parses the request and identifies required trip details.
3.  System presents a trip summary, including origin, destination, and
    illustrative estimates where available.
4.  Rider reviews and confirms the request.
5.  System creates a booking and returns its identifier and current
    status.
6.  The UI displays the booking and its current state.

**Expected result:** the rider can identify the trip details and
understand whether the booking has been created and whether a driver is
assigned.

### Journey B: Driver Cancels and Recovery Is Attempted

1.  A booking has an assigned simulated driver.
2.  The driver cancellation action is triggered.
3.  System records the cancellation and updates the booking state.
4.  System attempts to assign an eligible backup driver according to the
    MVP's simulated rules.
5.  If a backup is assigned, the booking reflects the new assignment.
6.  If no backup is available, the booking moves to an explicit
    unfulfilled/no-backup state.

**Expected result:** the UI does not leave the rider with a stale
assignment or imply that recovery succeeded when it did not.

### Journey C: Inspect Trips and Operations

1.  Rider opens the trip list or booking detail.
2.  Dispatcher/driver demo view opens the relevant operational list.
3.  System displays current persisted booking and driver states.
4.  Statuses and available actions reflect the booking lifecycle.

**Expected result:** the same booking state is represented consistently
across the supported views.

## 8. Functional Requirements

Priority labels: **P0** = required for the MVP; **P1** = important
improvement; **P2** = future consideration.

  -----------------------------------------------------------------------------
  ID                Priority          Requirement       Acceptance Criteria
  ----------------- ----------------- ----------------- -----------------------
  FR-01             P0                Accept a trip     Rider can submit trip
                                      request           details through the
                                                        supported request UI.

  FR-02             P0                Parse trip intent System extracts
                                                        supported trip fields
                                                        and identifies missing
                                                        or ambiguous required
                                                        details instead of
                                                        silently inventing
                                                        them.

  FR-03             P0                Review trip       Rider can review
                                      summary           origin, destination,
                                                        and available estimates
                                                        before confirming.

  FR-04             P0                Show illustrative Distance, duration, and
                                      estimates         fare are labelled or
                                                        documented as estimates
                                                        generated by the demo
                                                        logic.

  FR-05             P0                Create booking    A valid confirmation
                                                        creates a persistent
                                                        booking record and
                                                        returns a booking
                                                        identifier.

  FR-06             P0                Display booking   Rider can see the
                                      status            current booking status
                                                        and assigned driver
                                                        when applicable.

  FR-07             P0                Simulate driver   Eligible simulated
                                      assignment        drivers can be assigned
                                                        according to the MVP
                                                        rules.

  FR-08             P0                Progress trip     Supported driver
                                      lifecycle         actions update the
                                                        booking and driver
                                                        status consistently.

  FR-09             P0                Process driver    Cancellation is
                                      cancellation      recorded and the
                                                        previous assignment is
                                                        no longer shown as
                                                        active.

  FR-10             P0                Attempt recovery  After cancellation,
                                                        system attempts the
                                                        supported backup
                                                        assignment flow.

  FR-11             P0                Represent         If a backup is
                                      recovery success  assigned, booking and
                                                        UI show the new
                                                        assignment and status.

  FR-12             P0                Represent         If no backup is
                                      recovery failure  available, system shows
                                                        an explicit
                                                        unfulfilled/no-backup
                                                        state.

  FR-13             P0                Show trip history Rider can inspect
                                                        persisted bookings in
                                                        the supported customer
                                                        view.

  FR-14             P0                Provide           Demo dispatch/driver
                                      operations views  views show relevant
                                                        booking and driver
                                                        states.

  FR-15             P0                Persist demo      Booking and driver
                                      state             changes persist using
                                                        the prototype's local
                                                        JSON persistence.

  FR-16             P1                Use optional AI   When server-side AI
                                      parsing           configuration is
                                                        available, the parser
                                                        may use it; the app
                                                        should have a
                                                        documented fallback
                                                        behavior when it is not
                                                        configured or fails.

  FR-17             P0                Keep state        Invalid or unsupported
                                      transitions       transitions must not
                                      consistent        silently produce
                                                        contradictory booking
                                                        and driver states.
  -----------------------------------------------------------------------------

## 9. Booking States and Business Rules

The exact state names should match the implementation's API and data
model. At a product level, the system must distinguish at least:

-   **Requested / pending:** request has been received but assignment is
    not yet confirmed.
-   **Assigned:** a driver has been assigned.
-   **In progress:** trip has started, where supported by the prototype.
-   **Completed:** trip lifecycle has completed.
-   **Cancelled:** booking has been cancelled.
-   **Recovery in progress:** the system is attempting a supported
    recovery after assignment failure or driver cancellation.
-   **Unfulfilled / no backup:** recovery did not produce a replacement
    assignment.

### Business Rules

1.  A booking must have a unique identifier.
2.  A booking's displayed status must match the persisted status.
3.  An assigned driver must not be displayed as actively assigned after
    their cancellation has been processed.
4.  A recovery attempt must end in a clearly represented result:
    replacement assigned or no backup available.
5.  The system must not claim that a replacement driver is confirmed
    until an assignment is actually recorded.
6.  Fare, distance, and duration values produced by the prototype are
    illustrative and must not be represented as live quotes.
7.  AI parsing output is untrusted input and must be validated before it
    can create or change a booking.
8.  Invalid requests and failed operations should return a useful error
    and must not leave partially updated state where avoidable.

## 10. AI Behavior and Boundaries

AI is an optional interpretation layer, not the authority for dispatch
or booking state.

### Requirements

-   Parse only supported trip information from the rider's request.
-   Identify missing required fields and ask for clarification when
    needed.
-   Validate AI-produced values against the application's accepted
    schema and rules.
-   Do not allow AI output to directly bypass booking validation or
    state-transition logic.
-   Fall back gracefully when the AI service is unavailable or not
    configured.
-   Do not invent driver availability, live traffic, precise pickup
    times, real fares, or completed actions.
-   Make it clear that route and fare estimates are illustrative in the
    current demo.

## 11. Data Requirements

The MVP uses local JSON persistence. The conceptual entities are:

### Booking

-   Unique booking identifier.
-   Origin and destination.
-   Parsed or structured trip request details.
-   Estimated distance, duration, and fare, when available.
-   Current booking status.
-   Assigned driver identifier, when applicable.
-   Creation and update timestamps, where implemented.
-   Cancellation and recovery outcome information, where implemented.

### Driver

-   Unique driver identifier.
-   Display information needed by the demo.
-   Simulated availability/status.
-   Current assignment, when applicable.

### Data Integrity

-   Booking and driver references must be consistent.
-   Assignment and cancellation operations must update related records
    coherently.
-   Malformed or missing persistence data should produce a controlled
    error or documented recovery behavior.
-   The prototype's local JSON storage is for demonstration only and is
    not suitable for concurrent production workloads.

## 12. UX and Accessibility Requirements

-   Use clear labels for origin, destination, fare estimate, driver, and
    booking status.
-   Keep the primary booking action visually distinct.
-   Display loading, success, empty, and error states where relevant.
-   Explain failed recovery in plain language and provide an appropriate
    next action where supported.
-   Do not communicate simulated driver or route data as live data.
-   Use semantic controls, visible focus states, readable contrast, and
    labels for interactive inputs.
-   Ensure status is communicated through text, not color alone.
-   Avoid losing a rider's entered trip details when a recoverable
    validation error occurs.

## 13. Technical Overview

### Current MVP Architecture

-   **Frontend:** HTML, CSS, and vanilla JavaScript.
-   **Backend:** Node.js using the built-in HTTP server.
-   **Persistence:** local JSON files.
-   **Trip parsing:** rule-based parser, with optional server-side
    OpenAI API integration.
-   **Routing and fare:** illustrative calculations, not a production
    mapping provider.
-   **Driver supply:** seeded/simulated fleet.
-   **Validation:** API smoke tests for core prototype flows.

### Runtime Setup

1.  Install Node.js 18 or later.
2.  Extract the project archive.
3.  Run `node server.js` from the project directory.
4.  Open `http://localhost:3000` in a browser.

This setup is for local demonstration and evaluation. It does not
constitute a production deployment procedure.

## 14. Non-Functional Requirements

### Reliability and Data Integrity

-   Core booking operations should return explicit success or failure
    results.
-   Failed operations should not be reported as successful.
-   State changes should remain consistent across customer and
    operations views.
-   Persistence limitations and recovery behavior should be documented.

### Performance

-   The demo should remain responsive for a small, local evaluation
    workload.
-   No production-scale throughput or latency target has been
    established.

### Security and Privacy

-   The prototype is not production-ready for personal or payment data.
-   Secrets such as API keys must remain server-side and must not be
    embedded in frontend code.
-   A production version requires authentication, authorization, input
    validation, rate limiting, secure secret management, transport
    security, and a privacy/data-retention policy.
-   Do not use the demo as a real dispatch service without a separate
    security and safety review.

### Observability

-   Failures in parsing, booking creation, assignment, and recovery
    should be diagnosable during testing.
-   A production version should add structured logs, monitoring,
    alerting, and audit history.

## 15. Success Metrics

The following are proposed measurement definitions. Baselines and
numeric targets must be agreed before a live pilot.

  -----------------------------------------------------------------------
  Metric                  Definition              MVP Measurement
  ----------------------- ----------------------- -----------------------
  Booking creation        Valid booking attempts  API or smoke-test
  success rate            that create a booking / results
                          total valid booking     
                          attempts                

  Parse completion rate   Supported requests      Test set or demo
                          parsed without manual   observations
                          correction / supported  
                          requests submitted      

  Recovery attempt        Recovery attempts that  Scenario tests
  completion rate         end in a recorded       
                          outcome / total         
                          recovery attempts       

  Recovery success rate   Recovery attempts       Simulated scenario
                          resulting in a          results
                          replacement assignment  
                          / total recovery        
                          attempts                

  State consistency       Tested lifecycle        Integration and smoke
                          operations with         tests
                          matching booking,       
                          driver, and UI state /  
                          total tested operations 

  Error clarity           Failed scenarios that   QA checklist
                          show a useful, accurate 
                          message / total tested  
                          failure scenarios       
  -----------------------------------------------------------------------

These metrics evaluate prototype behavior. Simulated recovery rates must
not be treated as evidence of real-world driver supply or service
reliability.

## 16. Risks and Mitigations

  -----------------------------------------------------------------------
  Risk                    Impact                  Mitigation
  ----------------------- ----------------------- -----------------------
  Simulated fleet creates Demo may be mistaken    Label the fleet and all
  unrealistic             for a live service      operational data as
  expectations                                    simulated.

  Illustrative            Users may rely on       Clearly label estimates
  routing/fare logic is   misleading estimates    and replace the logic
  inaccurate                                      before any real-world
                                                  pilot.

  AI returns malformed or Invalid bookings or     Validate schema and
  incorrect trip details  confusing UX            business rules; support
                                                  fallback parsing and
                                                  clarification.

  Cancellation and        Rider sees stale or     Centralize state
  recovery produce        contradictory           transitions and test
  inconsistent states     information             success and failure
                                                  branches.

  Local JSON storage is   Lost or corrupted       Use a transactional
  not concurrency-safe    updates under           database before
                          concurrent usage        production or
                                                  multi-user deployment.

  Missing authentication  Unauthorized access or  Implement and review
  and authorization       changes                 access controls before
                                                  real-user use.

  No live notifications   Rider may not see       Add notification
                          status changes promptly infrastructure before
                                                  operational use.
  -----------------------------------------------------------------------

## 17. Delivery Plan

### Phase 1: Demo MVP

-   Trip request and parsing.
-   Trip summary and illustrative estimates.
-   Booking creation and listing.
-   Simulated driver assignment and lifecycle.
-   Cancellation recovery and no-backup outcome.
-   Customer and operations demo views.
-   Local persistence and smoke tests.

### Phase 2: Hardening

-   Automated unit and integration tests.
-   Explicit state-transition model and stronger data validation.
-   Better error handling, logging, and test coverage.
-   Responsive and accessibility review.
-   Configuration and deployment documentation.

### Phase 3: Pilot Readiness

-   Real mapping and routing provider.
-   Real driver availability and dispatch integration.
-   Authentication and role-based authorization.
-   Production database and concurrency-safe transactions.
-   Notifications and customer support workflows.
-   Security, privacy, safety, and legal review.
-   Defined service-level targets and operational monitoring.

A real-world pilot should not begin until the Phase 3 dependencies are
addressed and reviewed.

## 18. MVP Acceptance Criteria

The MVP is acceptable for demonstration when all of the following are
true:

-   [ ] A rider can submit a supported trip request.
-   [ ] The system produces a reviewable trip summary.
-   [ ] Missing or invalid required details are handled explicitly.
-   [ ] A valid confirmation creates a persistent booking with an
    identifier.
-   [ ] The booking's status is visible in the supported customer view.
-   [ ] Simulated driver assignment is reflected consistently.
-   [ ] Driver lifecycle actions update the booking state as expected.
-   [ ] Driver cancellation triggers a recovery attempt.
-   [ ] Recovery success shows the replacement assignment.
-   [ ] Recovery failure shows an explicit no-backup/unfulfilled state.
-   [ ] Customer and operations views do not show contradictory states.
-   [ ] Core API smoke tests pass.
-   [ ] Demo-only limitations are documented and not presented as live
    capabilities.

## 19. Assumptions and Open Questions

The following decisions require confirmation before expanding beyond the
demo:

1.  What geography and ride categories should a future pilot support?
2.  What exact service promise does "Every ride needs a Plan B"
    represent: a recovery attempt, a guaranteed replacement, or another
    defined service?
3.  What is the required recovery timeout before declaring a booking
    unfulfilled?
4.  Should riders approve a replacement driver's updated ETA or fare
    before reassignment?
5.  What cancellation rules, fees, and refund policies should apply?
6.  Which mapping, routing, dispatch, payment, and notification
    providers will be used?
7.  What rider and driver verification requirements apply?
8.  What are the target values for booking success, recovery time, and
    service reliability?
9.  What data retention, consent, privacy, and audit requirements apply?
10. Who owns operational support when no backup driver is available?

## 20. Definition of Done

A requirement is complete when its expected behavior is implemented, the
relevant success and failure paths are tested, errors are
understandable, persisted state is consistent, and documentation
reflects the actual implementation. Any behavior that is simulated must
be identified as such.

------------------------------------------------------------------------

**Document note:** This PRD describes the RideWise AI demo MVP and a
proposed path toward a pilot. It does not assert that production
dispatch, live tracking, payments, real driver availability, or
production-grade security are implemented.
