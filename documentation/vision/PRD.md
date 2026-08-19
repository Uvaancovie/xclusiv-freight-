# PRD: Exclusiv Freight Logistics & Document Management

## 1. Executive Summary
Exclusiv Freight is a mobile solution designed to digitize the end-to-end logistics workflow for a long-haul trucking fleet. The application bridges the gap between field drivers and office administration by automating document capture (PODs, diesel slips) and load dispatching, directly addressing manual communication bottlenecks.

## 2. Problem Statement
The current logistics flow relies on manual communication (phone calls and physical paperwork) to track load status and fleet expenses. This creates significant delays in document processing, prevents real-time oversight of diesel expenditure, and slows down the invoicing cycle in Sage.

## 3. Goals & Success Metrics
The primary objective is to minimize unnecessary communication and improve operational flow.
- **Goal 1:** Eliminate the need for manual status-update phone calls between drivers and the dispatcher.
- **Goal 2:** Reduce the time between delivery completion and invoice readiness by providing instant digital PODs.
- **Success Metric A:** Achieve a measurable reduction in daily fleet-related phone calls.
- **Success Metric B:** 100% of trip documents (PODs and Diesel Slips) are digitized and sent to the owner within 15 minutes of capture.

## 4. Stakeholder Personas
- **Sebastian Chetty (Fleet Owner / Dispatcher):** Needs full administrative oversight, the ability to dispatch loads digitally, and real-time access to expense documents for Sage invoicing.
- **Drivers:** Need a simple, driver-centric view to receive instructions, scan receipts in low-light conditions, and capture consignee signatures on the road.

## 5. User Stories
- **Load Dispatch:** As a Fleet Owner, I want to create and send load instructions directly to a driver's phone so that I can eliminate manual verbal briefing.
- **Document Digitization:** As a Driver, I want to scan my diesel slips and toll receipts immediately at the point of purchase so the office has a digital record for expense tracking.
- **Proof of Delivery:** As a Driver, I want the consignee to sign for the cargo on my screen so that the load can be marked as complete and verified instantly.
- **Automated Reporting:** As a Fleet Owner, I want to receive formatted trip reports via WhatsApp and Email automatically so that I can process Sage invoices without chasing paperwork.

## 6. High-Level Functional Scope
- **Role-Based Access:** Instant switching between "Fleet Owner" and "Driver" console modes.
- **Load Management:** Digital creation and distribution of trip references, truck registrations, and cargo details.
- **Advanced Document Capture:** High-speed scanning for PODs, diesel slips, weighbridge certificates, and toll receipts.
- **Digital Signatures:** Integrated signature pad for delivery verification.
- **Communication Engine:** Formatted dispatch of trip data and images via WhatsApp and Email.
- **Offline Capability:** The system maintains full operational capability in transit corridors with poor connectivity, such as Van Reenen's Pass.

## 7. Out of Scope
- Direct API writing into Sage (The app provides the formatted data; Sebastian performs final invoicing in Sage).
- Real-time GPS vehicle tracking (focused on document and load status flow).

## 8. Assumptions & Dependencies
- **Hardware:** Drivers have Android devices equipped with functional cameras.
- **Connectivity:** While the app is offline-first, a periodic 3G/4G/5G connection is required to trigger WhatsApp/Email dispatches.
- **Sage Interface:** Sebastian maintains an active Sage account for final invoicing based on the app's output.
