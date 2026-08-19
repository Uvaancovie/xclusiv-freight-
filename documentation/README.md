This README.md serves as the entry point for the Exclusiv Freight repository. It is designed to provide your code agent and development team with a clear "source of truth" regarding the application's purpose, core features, and technical architecture
.
Exclusiv Freight: Logistics & Document Management
1. Project Overview
Exclusiv Freight is a specialized, offline-first native Android application designed for long-haul freight operations
. The application bridges driver field activities—such as scanning fuel receipts and capturing delivery signatures—directly to fleet management dashboards with automated reporting triggers
.
The system supports two primary operational profiles:
Fleet Owner / Dispatcher (Sebastian Chetty): Manages load instructions and monitors fleet expenses
.
Drivers: Executes trips, scans documents, and captures Proof of Delivery (POD)
.
2. Core Functional Features
The application implements the following core modules to minimize unnecessary communication and improve workflow
:
Role-Based Console Switching: Allows instant switching between Driver and Fleet Owner modes via a header toggle
.
Load Instruction & Dispatch: The Fleet Owner creates detailed trip instructions (truck registration, cargo, pickup/offload locations) that populate directly in the driver’s active view
.
High-Speed Document Capture: Uses CameraX to scan PODs, diesel slips, weighbridge certificates, and toll receipts with real-time alignment guides
.
Digital Signature Pad: A custom module for consignees to sign directly on the mobile screen to verify delivery
.
Automated Dispatch Engine: Construct and sends formatted WhatsApp and Email reports containing trip details and scanned images to Sebastian Chetty
.
Universal Search Engine: Real-time filtering of trip logs and uploads by load number, driver, or truck registration with sub-100ms latency
.
3. Technical Stack
The application is built using a modern, reactive Android architecture
:
Layer
Technology / Library
Platform
Android SDK (Kotlin)
UI Framework
Jetpack Compose + Material Design 3
Architecture
MVVM + Repository Pattern
Persistence
Android Room (SQLite) for offline-first reliability
Camera
AndroidX CameraX
Async/Streams
Kotlin Coroutines & StateFlow
Image Loading
Coil Compose
4. Documentation Structure
To ensure clear communication and maintainability, this repository is organized into the following Markdown files:
GLOSSARY.md: Precise definitions for logistics terms like POD, Load Instruction, and Diesel Slip
.
/vision/PRD.md: Defines what is being built and why it matters to the business
.
/requirements/FUNCTIONAL.md: Detailed, atomic "Actor Perspective" requirements (e.g., "The Driver scans a slip")
.
/requirements/NON_FUNCTIONAL.md: Performance (e.g., <500ms camera init), security, and usability targets
.
/technical/DATA_SCHEMA.md: Room SQLite table definitions and ERDs
.
/quality/BDD_SCENARIOS.md: Gherkin scenarios (Given/When/Then) for verifiable business logic
.
5. Instructions for the Code Agent
When working on this project, adhere to the following documentation principles:
Present Tense Only: Describe the system as if it already exists (e.g., "The system sends..." not "The system will send")
.
No Noise: Avoid subjective opinions, suggestions, or discussions in the final code and docs. State only verifiable facts
.
Atomic Requirements: Every function must be checkable and refer to one, and only one, thing for testing purposes
.
Offline-First: Always prioritize local data persistence to the Room DB before attempting network synchronization to ensure reliability in low-connectivity corridors like Van Reenen's Pass
.