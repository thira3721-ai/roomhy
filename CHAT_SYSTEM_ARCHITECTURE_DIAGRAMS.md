# Chat System Architecture - Visual Flow

## Overall System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                     RoomHy Chat System                              │
│                    (5 User Role Panels)                             │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                 ┌────────────────┼────────────────┐
                 │                │                │
         ┌───────▼────────┐ ┌────▼────────┐ ┌───▼──────────┐
         │  Frontend      │ │   Backend   │ │  Database    │
         │  (5 Panels)    │ │  (Node.js)  │ │  (MongoDB)   │
         └────────────────┘ └─────────────┘ └──────────────┘
```

---

## Panel 1: Super Admin Panel

```
┌─────────────────────────────────────────────────────┐
│         SUPER ADMIN CHAT (chatadmin.html)           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Tabs: Direct | Groups | Direct Support       │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌─ DIRECT TAB ──────────────────────────────────┐ │
│  │ Area Managers List:                           │ │
│  │  • RYGA6319 (Online)                          │ │
│  │  • RYGA7154 (Online)                          │ │
│  │                                               │ │
│  │ Chat with RYGA6319:                           │ │
│  │ ┌────────────────────────────────────────┐   │ │
│  │ │ SA: Hello Manager                      │   │ │
│  │ │ RYGA6319: Hi Super Admin               │   │ │
│  │ └────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ GROUPS TAB ───────────────────────────────────┐ │
│  │ [Create Group] "G001" "G002"                    │ │
│  │                                               │ │
│  │ Group "G001" Members:                         │ │
│  │  • RYGA6319, RYGA7154, RYGA4410              │ │
│  │                                               │ │
│  │ Messages:                                     │ │
│  │ ┌────────────────────────────────────────┐   │ │
│  │ │ SA: All managers, project update       │   │ │
│  │ │ RYGA6319: Got it                       │   │ │
│  │ │ RYGA7154: Thanks for update            │   │ │
│  │ └────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ DIRECT SUPPORT TAB ───────────────────────────┐ │
│  │ Open Support Tickets:                          │ │
│  │  • TK_001 with ROOMHY3986 (Owner)             │ │
│  │  • TK_002 with TNTKO9862 (Tenant)             │ │
│  │                                               │ │
│  │ Chat with ROOMHY3986:                         │ │
│  │ ┌────────────────────────────────────────┐   │ │
│  │ │ Owner: Property maintenance issue      │   │ │
│  │ │ SA: I'll assign this to a manager      │   │ │
│  │ └────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Message Input: [Type here...] [Send]              │
└─────────────────────────────────────────────────────┘

Room IDs Used:
  Direct:  SUPER_ADMIN_RYGA6319
  Group:   GROUP_G001
  Support: SUPPORT_TK_001
```

---

## Panel 2: Area Manager Panel

```
┌─────────────────────────────────────────────────────┐
│      AREA MANAGER CHAT (managerchat.html)           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Tabs: Super Admin | Groups | Support         │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌─ SUPER ADMIN TAB ──────────────────────────────┐ │
│  │ Chat with Super Admin:                        │ │
│  │ ┌────────────────────────────────────────┐   │ │
│  │ │ RYGA6319: Hello Super Admin            │   │ │
│  │ │ SA: Hi, need anything?                 │   │ │
│  │ │ RYGA6319: Can you review the report?   │   │ │
│  │ └────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ GROUPS TAB ───────────────────────────────────┐ │
│  │ Group "G001" (created by SA):                 │ │
│  │ Members: RYGA6319, RYGA7154, RYGA4410        │ │
│  │                                               │ │
│  │ Messages:                                     │ │
│  │ ┌────────────────────────────────────────┐   │ │
│  │ │ SA: All managers, project update       │   │ │
│  │ │ RYGA6319: Got it                       │   │ │
│  │ │ RYGA7154: Thanks for update            │   │ │
│  │ └────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ SUPPORT TAB ──────────────────────────────────┐ │
│  │ Support Tickets Assigned:                     │ │
│  │  • TK_002 with TNTKO9862 (Status: Open)      │ │
│  │  • TK_003 with ROOMHY2653 (Status: In Prog)  │ │
│  │                                               │ │
│  │ Chat TK_002 (Tenant TNTKO9862):              │ │
│  │ ┌────────────────────────────────────────┐   │ │
│  │ │ Tenant: Can't pay rent this month      │   │ │
│  │ │ RYGA6319: Let me check your account    │   │ │
│  │ │ RYGA6319: We can discuss payment plan  │   │ │
│  │ └────────────────────────────────────────┘   │ │
│  │ [Mark as Resolved]                            │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Message Input: [Type here...] [Send]              │
└─────────────────────────────────────────────────────┘

Room IDs Used:
  Super Admin: SUPER_ADMIN_RYGA6319
  Group:       GROUP_G001
  Support:     SUPPORT_TK_002
```

---

## Panel 3: Property Owner Panel

```
┌─────────────────────────────────────────────────────┐
│       PROPERTY OWNER CHAT (chat.html)               │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Tabs: Tenants | Support                      │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌─ TENANTS TAB ──────────────────────────────────┐ │
│  │ My Properties & Tenants:                      │ │
│  │  ROOMHY3986:                                 │ │
│  │   • TNTKO9862 (Online)                       │ │
│  │   • TNTKO4740 (Offline)                      │ │
│  │  ROOMHY2653:                                 │ │
│  │   • TNTKO5555 (Online)                       │ │
│  │                                               │ │
│  │ Chat with TNTKO9862:                         │ │
│  │ ┌────────────────────────────────────────┐   │ │
│  │ │ Owner: How is the AC working?           │   │ │
│  │ │ Tenant: Still making noise              │   │ │
│  │ │ Owner: I'll send someone to fix it      │   │ │
│  │ └────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ SUPPORT TAB ──────────────────────────────────┐ │
│  │ [Request Support from Area Manager]            │ │
│  │                                               │ │
│  │ Active Support Tickets:                       │ │
│  │  • TK_001 (Property maintenance issue)        │ │
│  │                                               │ │
│  │ Chat TK_001:                                 │ │
│  │ ┌────────────────────────────────────────┐   │ │
│  │ │ Owner: Need help with tenant complaint │   │ │
│  │ │ SA: I'll assign this to manager RYGA6319   │ │
│  │ │ RYGA6319: I'll visit and assess         │   │ │
│  │ └────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Message Input: [Type here...] [Send]              │
└─────────────────────────────────────────────────────┘

Room IDs Used:
  Tenant Chat: OWNER_ROOMHY3986_TENANT_TNTKO9862
  Support:     SUPPORT_TK_001
```

---

## Panel 4: Tenant Chat Panel

```
┌─────────────────────────────────────────────────────┐
│        TENANT CHAT (tenantchat.html)                │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Tabs: My Owner | Support                     │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌─ MY OWNER TAB ────────────────────────────────┐ │
│  │ Chatting with Owner: ROOMHY3986              │ │
│  │                                               │ │
│  │ Messages:                                     │ │
│  │ ┌────────────────────────────────────────┐   │ │
│  │ │ Tenant: AC is making noise              │   │ │
│  │ │ Owner: How is the AC working?           │   │ │
│  │ │ Tenant: Still making noise              │   │ │
│  │ │ Owner: I'll send someone to fix it      │   │ │
│  │ └────────────────────────────────────────┘   │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ SUPPORT TAB ──────────────────────────────────┐ │
│  │ [Request Support]                              │ │
│  │                                               │ │
│  │ Support Tickets:                              │ │
│  │  • TK_004 (Complaint about noise)             │ │
│  │                                               │ │
│  │ Chat TK_004:                                 │ │
│  │ ┌────────────────────────────────────────┐   │ │
│  │ │ Tenant: Neighbor making too much noise │   │ │
│  │ │ Support (RYGA7154): I'll investigate   │   │ │
│  │ │ RYGA7154: Will talk to neighbor        │   │ │
│  │ │ Tenant: Thanks for your help           │   │ │
│  │ └────────────────────────────────────────┘   │ │
│  │ [Mark as Resolved]                            │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Message Input: [Type here...] [Send]              │
└─────────────────────────────────────────────────────┘

Room IDs Used:
  Owner Chat: OWNER_ROOMHY3986_TENANT_TNTKO9862
  Support:    SUPPORT_TK_004
```

---

## Panel 5: Website Visitor Chat Panel

```
┌─────────────────────────────────────────────────────┐
│      WEBSITE VISITOR CHAT (chathome.html)           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Tabs: My Inquiries | New Inquiry             │  │
│  └──────────────────────────────────────────────┘  │
│                                                     │
│  ┌─ MY INQUIRIES TAB ────────────────────────────┐ │
│  │ Inquiries Made:                               │ │
│  │                                               │ │
│  │ 1. ROOMHY3986 (3 BHK Apartment)              │ │
│  │    Status: ⏳ Pending...                     │ │
│  │    [Owner hasn't responded yet]              │ │
│  │                                               │ │
│  │ 2. ROOMHY2653 (2 BHK House)                  │ │
│  │    Status: ✅ ACCEPTED!                      │ │
│  │    Owner: ROOMHY2653                         │ │
│  │                                               │ │
│  │    Chat with Owner:                          │ │
│  │    ┌────────────────────────────────────────┐ │
│  │    │ Visitor: When can I view the property? │ │
│  │    │ Owner: Saturday 2-4 PM available        │ │
│  │    │ Visitor: Great! See you then           │ │
│  │    │ Owner: Thanks!                          │ │
│  │    └────────────────────────────────────────┘ │
│  │                                               │ │
│  │    [Schedule View] [Get Directions]           │ │
│  │                                               │ │
│  │ 3. ROOMHY5555 (Villa)                        │ │
│  │    Status: ❌ REJECTED                       │ │
│  │    [Owner not interested]                    │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌─ NEW INQUIRY TAB ──────────────────────────────┐ │
│  │ Send Property Inquiry:                        │ │
│  │                                               │ │
│  │ Select Property: [ROOMHY6789 - 3 BHK Apt]   │ │
│  │ Your Email: [visitor@example.com]           │ │
│  │ Your Phone: [+919876543210]                 │ │
│  │ Message:                                     │ │
│  │ ┌────────────────────────────────────────┐   │ │
│  │ │Interested in viewing the property.    │   │ │
│  │ │Available weekends. Please confirm.     │   │ │
│  │ └────────────────────────────────────────┘   │ │
│  │ [Send Inquiry Request]                       │ │
│  │ [Clear]                                      │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  Message Input: [Type here...] [Send]              │
└─────────────────────────────────────────────────────┘

Room IDs & States Used:
  Inquiry Request:  INQUIRY_INQ_001 (status: pending)
  Chat After Accept: INQUIRY_INQ_002 (status: accepted)
```

---

## Message Flow Diagram

### 1. Direct Message Flow (1-to-1)

```
User A                         Socket.IO Server                        User B
   │                                  │                                  │
   │  1. init('USER_A')              │                                  │
   │──────────────────────────────────>                                  │
   │                                  │ Socket connected                │
   │                                  │                                  │
   │  2. joinRoom('USER_B')           │                                  │
   │──────────────────────────────────>                                  │
   │                                  │ Room: USER_A_USER_B             │
   │                                  │                                  │
   │                                  │                    init('USER_B')│
   │                                  │<──────────────────────────────── │
   │                                  │ Socket connected                │
   │                                  │<──────────────────────────────── │
   │                                  │ joinRoom('USER_A')              │
   │                                  │ (creates same room)             │
   │                                  │                                  │
   │  3. sendMessage('Hi', 'USER_B')  │                                  │
   │──────────────────────────────────>                                  │
   │     a) Save to DB                │                                  │
   │     b) Emit to socket             │                                  │
   │                                  │  4. receive-message event       │
   │                                  │─────────────────────────────────> │
   │                                  │                      onMessage() │
   │                                  │                    displayMsg()  │
   │                                  │                                  │
   │  Response...                      │                                  │
   │<──────────────────────────────────│<────────────────────────────────│
```

### 2. Group Message Flow

```
User A (Group)              Socket.IO Server                    User B (Group)
   │                               │                               │
   │  joinGroupChat('G001')        │                               │
   │──────────────────────────────>│                               │
   │                    Room: GROUP_G001                           │
   │                               │                               │
   │                               │      joinGroupChat('G001')    │
   │                               │<──────────────────────────────│
   │                               │ (Both in same room)           │
   │                               │                               │
   │  sendGroupMessage('Hi Group', 'G001')                         │
   │──────────────────────────────>│                               │
   │                               │ receive-group-message         │
   │                               │──────────────────────────────>│
   │                               │                 onGroupMessage()
   │                               │                               │
```

### 3. Support Ticket Flow

```
Owner                    Area Manager                      Super Admin
   │                          │                                 │
   │  Has Issue                │                                 │
   │─ createSupportTicket()    │                                 │
   │─ POST /api/support/create │                                 │
   │─────────────────────────────────────────────────────────────>│
   │                          │                     Ticket TK_001 Created
   │                          │<──────────────────────────────────│
   │                          │ Assign to Manager                 │
   │<──────────────────────────│─────────────────────────────────│
   │                          │                                 │
   │ joinSupportChat('TK_001')  │ joinSupportChat('TK_001')      │
   │──────────────────────────>│<──────────────────────────────  │
   │                 Room: SUPPORT_TK_001                        │
   │                          │                                 │
   │  sendSupportMessage(...)  │                                 │
   │──────────────────────────>│                                 │
   │                          │ receive-message                  │
   │                          │────────────────────────────────> │
   │                          │              displaySupportMsg() │
   │                          │                                 │
   │                          │  sendSupportMessage(...)         │
   │                          │<──────────────────────────────  │
   │<──────────────────────────│                                 │
   │                          │                                 │
   │                          │  updateTicketStatus('resolved')  │
   │                          │────────────────────────────────> │
   │                          │ ticket-updated event             │
   │                          │<─────────────────────────────── │
   │ onTicketUpdate()          │                                 │
   │ Display: "Resolved"       │                                 │
```

### 4. Property Inquiry Flow

```
Website Visitor          Socket.IO Server          Property Owner
      │                        │                        │
      │ sendInquiryRequest()   │                        │
      │ (property, email, msg) │                        │
      ├───────────────────────>│ Store in DB            │
      │                        │ Inquiry: INQ_001       │
      │                        │ Status: pending        │
      │                        │                        │
      │                        │ Notify Owner           │
      │                        │────────────────────────>│
      │                        │ [New Inquiry Request]  │
      │                        │ From: visitor@email    │
      │                        │                        │
      │ onInquiryStatusChange()│                        │
      │ Status: pending        │                        │
      │ [Waiting for response]│                        │
      │                        │                        │
      │                        │ acceptInquiry('INQ_001')
      │                        │<────────────────────────│
      │                        │ Update DB              │
      │                        │ Status: accepted       │
      │                        │                        │
      │ onInquiryStatusChange()│                        │
      │ Status: accepted ✅    │                        │
      │                        │                        │
      │ joinInquiryChat()      │                        │
      │────────────────────────>│ Room: INQUIRY_INQ_001  │
      │                        │────────────────────────>│
      │                        │ joinInquiryChat()      │
      │                        │                        │
      │ sendInquiryMessage()   │                        │
      │─────────────────────────────────────────────────>│
      │                        │ receive-message        │
      │                        │ Chat interface opens   │
      │                        │                        │
      │<──────────────────────────────────────────────── │
      │ sendInquiryMessage()   │                        │
      │                        │ Chat continues...      │
```

---

## Summary

Each of the 5 panels has specific chat workflows:

| Panel | Chat Types | Room ID Pattern |
|-------|-----------|-----------------|
| **Super Admin** | Direct, Group, Support | `SUPER_ADMIN_[ID]`, `GROUP_[ID]`, `SUPPORT_[ID]` |
| **Area Manager** | Direct, Group, Support | `SUPER_ADMIN_[ID]`, `GROUP_[ID]`, `SUPPORT_[ID]` |
| **Property Owner** | Tenant, Support | `OWNER_[OID]_TENANT_[TID]`, `SUPPORT_[ID]` |
| **Tenant** | Owner, Support | `OWNER_[OID]_TENANT_[TID]`, `SUPPORT_[ID]` |
| **Website Visitor** | Inquiry Request, Inquiry Chat | `INQUIRY_[ID]` |

All use the same underlying Socket.IO infrastructure with different room types and message types.
