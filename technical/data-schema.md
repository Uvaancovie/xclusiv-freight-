This DATA_SCHEMA.md defines the local persistence layer for the Exclusiv Freight application. The system utilizes an Android Room (SQLite) database to ensure offline-first reliability and data integrity in low-connectivity transit corridors
.
Data Schema: Exclusiv Freight (Room SQLite)
1. Database Overview
Database Name: FreightDatabase
Architecture: SQLite via Room Persistence Library
Persistence Strategy: Offline-first; 100% local persistence required before network synchronization
2. Table Definitions
Table: loads
Stores trip instructions dispatched by the Fleet Owner to the Driver
. | Column | Type | Description | | :--- | :--- | :--- | | load_id | PRIMARY KEY (String) | Unique UUID or Load Number (e.g., LOAD-2026-884)
 | | truck_registration | String | Vehicle license plate (e.g., ND 842-119)
 | | assigned_driver | String | Name of the driver executing the trip
 | | origin | String | Pickup location (e.g., Durban Container Terminal)
 | | destination | String | Offload hub (e.g., City Deep Logistics Hub)
 | | cargo_details | String | Description of freight
 | | weight_tons | Double | Cargo weight in tons
 | | pallet_count | Integer | Number of pallets
 | | special_instructions| String | Tarping or temperature control notes
 | | status | String | Enum: ACTIVE, COMPLETED
 |
Table: slips
Stores metadata and file references for document scans captured via CameraX
. | Column | Type | Description | | :--- | :--- | :--- | | slip_id | PRIMARY KEY (Integer) | Auto-incrementing unique identifier
 | | load_id | FOREIGN KEY (String) | Link to loads.load_id
 | | type | String | Enum: POD_DOCUMENT, DIESEL, WEIGHBRIDGE, TOLL
 | | image_path | String | Local file URI for the bitmap capture
 | | timestamp | Long | Unix timestamp of capture (dd MMM yyyy, HH:mm)
 | | location_stamp | String | GPS coordinates or location name at time of scan
 | | amount_zar | Double | Monetary value (for Diesel/Toll) in ZAR
 | | liters_filled | Double | Liters of fuel (for Diesel slips only)
 |
Table: pod_verifications
Stores specific verification data for completed deliveries
. | Column | Type | Description | | :--- | :--- | :--- | | verification_id | PRIMARY KEY (Integer) | Unique ID linked to a completed load
 | | load_id | FOREIGN KEY (String) | Link to loads.load_id
 | | consignee_name | String | Name of the person receiving the goods
 | | receiver_phone | String | Contact number for verification
 | | arrival_time | Long | Timestamp of arrival at destination
 | | damage_notes | String | Driver notes regarding shortages or damage
 | | signature_path | String | File reference to the captured digital signature
 |
3. Relationships & Data Access
One-to-Many: A single load may have multiple slips (e.g., several diesel slips and one weighbridge certificate)
.
One-to-One: A single load has exactly one pod_verification entry upon completion
.
Reactive Streams: Data access is handled via SlipDao and LoadDao interfaces, which expose data as Kotlin StateFlow streams for real-time UI updates
.
Documentation Rules for the Code Agent
Data Integrity: All captures must be written to the Room DB immediately upon shutter trigger
.
Present Tense: Logic should be described as "The DAO retrieves..." rather than "The DAO will retrieve."
No Noise: Table definitions must strictly match the logistical requirements provided by Sebastian Chetty (no extra "theoretical" fields)
.