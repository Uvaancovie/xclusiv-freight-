This `FUNCTIONAL.md` document details the specific actions and behaviors the **Exclusiv Freight** application must perform. Following established software engineering standards, these requirements are written in the **present tense**, from an **actor perspective**, and are **atomic** to ensure they are verifiable during testing.

***

# Functional Requirements: Exclusiv Freight

## 1. Role Management & Profile Switching
*   **FR-1.1: Multi-Console Toggle:** The system provides an instant toggle in the header (represented by "TM" or "SC" avatars) to switch between the **Driver Console** and the **Fleet Owner Console**.
*   **FR-1.2: Role State Persistence:** The application maintains the active role state (Driver vs. Owner) across sessions using reactive state flows within the view model.

## 2. Load Instruction & Dispatch
*   **FR-2.1: Trip Creation:** The Fleet Owner creates load instructions by inputting specific trip data, including:
    *   Trip Reference / Load Number (e.g., LOAD-2026-884).
    *   Truck Registration and Assigned Driver Name.
    *   Pickup/Offload locations and Cargo details (Weight in Tons, Pallet Count).
    *   Special Handling Instructions (e.g., tarping or temperature control).
*   **FR-2.2: Instant Dispatch:** Upon creation, the system populates the dispatched instruction in the assigned driver's active view and saves it to the local database.

## 3. Advanced Document Capture (CameraX)
*   **FR-3.1: Live Capture Viewport:** The system utilizes **CameraX** to provide a live scanning viewport featuring:
    *   Rectangular alignment guides for document framing.
    *   Real-time shutter action for instant image capture.
    *   Hardware controls for lens switching (Front/Rear) and Flash/Flashlight for night capture.
*   **FR-3.2: Fail-Safe Routine:** In the absence of physical camera hardware, the system executes an automated image generation routine that applies digital watermarks and timestamps.
*   **FR-3.3: Slip Categorization:** The system allows drivers to categorize scanned images into four types: **POD_DOCUMENT**, **DIESEL**, **WEIGHBRIDGE**, or **TOLL**.

## 4. Proof of Delivery (POD) & Verification
*   **FR-4.1: Digital Signature Capture:** The system includes a custom signature pad for consignees to sign directly on the mobile screen using touch or a stylus.
*   **FR-4.2: Consignee Documentation:** The system records the consignee’s name, receiver phone number, arrival time, and any shortage/damage notes provided by the driver.
*   **FR-4.3: Status Update:** Upon submission of a verified POD, the system automatically updates the load status to **COMPLETED**.

## 5. Automated Communication Engine
*   **FR-5.1: WhatsApp Dispatch:** Following any document capture (POD, Diesel, or Toll), the system constructs a formatted WhatsApp message containing trip data and scans, addressed to **Sebastian Chetty** (+27 82 123 4567).
*   **FR-5.2: Email Reporting:** The system generates pre-filled email body text containing transaction amounts, liters filled (for diesel), and location stamps for dispatch to **sebastian@exclusivfreight.co.za**.

## 6. Local Persistence & Synchronization
*   **FR-6.1: Room SQLite Storage:** The application saves all load instructions and scanned slips to the local **Room Database** to ensure data is not lost in offline areas.
*   **FR-6.2: Reactive Data Streams:** The system exposes data changes from the database as reactive streams to ensure the user interface updates instantly when records are added or modified.

## 7. History & Universal Search
*   **FR-7.1: Document History:** The system provides an **Upload History** screen that displays past uploads with thumbnail previews, category badges, and formatted timestamps.
*   **FR-7.2: Universal Search Engine:** The system provides interactive search bars on all primary screens to filter logs in real-time by load number, station vendor, driver, truck registration, or location.

***

### Documentation Rules for the Code Agent
*   **No Noise:** Do not add personal opinions or "I believe" statements to these requirements.
*   **Verifiability:** Each requirement listed above must be mapped to a specific test case in the `TRACEABILITY_MATRIX.md` to ensure it is implemented correctly.
*   **Actor Focus:** Always maintain the "The [User/System] does [Action]" structure to avoid vague "it is possible to..." statements.