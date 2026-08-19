This NON_FUNCTIONAL.md document specifies how the Exclusiv Freight application must perform and the quality attributes it must possess
. Following established software engineering standards, these requirements are measurable, verifiable, and focus on architecture and system behavior
.
Non-Functional Requirements: Exclusiv Freight
1. Performance & Responsiveness
NFR-1.1: Camera Initialization Latency: The system shall initialize the CameraX viewfinder in less than 500 milliseconds from the trigger event
.
NFR-1.2: Search Engine Throughput: The Universal Search Engine shall filter trip logs and document history with a dynamic latency of less than 100 milliseconds per query
.
NFR-1.3: Image Capture Speed: Real-time shutter action for instant bitmap capture must be maintained to ensure drivers can scan documents quickly at busy truck stops
.
2. Reliability & Offline Capability
NFR-2.1: Offline Persistence: The application must maintain full operational capability in low-connectivity or offline transit corridors (e.g., N3 Van Reenen's Pass)
.
NFR-2.2: Data Integrity (SQLite): To prevent data loss, 100% of captured trip data and scanned slip metadata must be persisted locally to the Room SQLite database before any network synchronization is attempted
.
NFR-2.3: Fail-Safe Availability: In the event of physical camera hardware failure, the system shall automatically provide a fail-safe routine to generate compliant images with digital watermarks and timestamps to maintain workflow continuity
.
3. Usability & User Interface
NFR-3.1: Design Standard Compliance: The user interface shall strictly adhere to Material Design 3 (M3) guidelines
.
NFR-3.2: Visual Accessibility: The system shall utilize a high-contrast theme optimized for logistics environments:
Canvas Contrast: #0B192C (Dark Canvas)
.
Primary Branding: #102A43 (Logistics Blue)
.
Accent Color: #D97706 (Amber Fuel Accents)
.
NFR-3.3: Ergonomics (Touch Targets): To ensure ease of use for drivers wearing gloves or in high-vibration environments, all interactive touch targets shall have a minimum size of 48dp
.
NFR-3.4: Learning Curve: The driver-centric view must be intuitive enough that a new driver can successfully scan a diesel slip and trigger a WhatsApp dispatch in under 60 seconds without prior training [User Context, 348].
4. Security & Privacy
NFR-4.1: Access Control: The system shall maintain distinct access levels, ensuring the Driver Console is focused on active tasks while the Fleet Owner Console has full administrative access across all records
.
NFR-4.2: Auditability: Every slip upload and status change (e.g., marking a load as COMPLETED) must include an automated timestamp and unique ID for traceability within the owner’s records
.
Documentation Rules for the Code Agent
Avoid Vague Terms: Do not use subjective language like "fast" or "user-friendly"
. Use the specific millisecond and pixel thresholds defined above
.
Separation of Concerns: Ensure these non-functional requirements are not mixed into functional code modules; they should be treated as constraints and quality bounds for the entire architecture
.
Verifiability: Every NFR listed must be checkable via automated performance tests or UI inspection to ensure compliance with Sebastian Chetty’s requirements
.