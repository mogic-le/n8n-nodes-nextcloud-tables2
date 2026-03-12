# n8n-nodes-nextcloud-tables2

Ein n8n Node für die Integration mit Nextcloud Tables.

- **Tabellen-Management**: Grundlegende CRUD-Operationen (getAll, get)
- **Spalten-Management**: Alle Operationen inkl. AI-friendly Extensions
- **Zeilen-Management**: Basis CRUD (create, getAll, get)
- **Views-Management**: Basis-Operationen (getAll, create)
- **Shares-Management**: Benutzer/Gruppen-Freigaben


## Installation

```bash
npm install n8n-nodes-nextcloud-tables2
```

Starten Sie n8n neu, um die neue Node zu laden.


## Konfiguration

### Credentials
Erstellen Sie neue Credentials vom Typ "Nextcloud Tables API":

1. **Nextcloud URL**: Vollständige URL (z.B. `https://cloud.example.com`)
2. **Benutzername**: Ihr Nextcloud-Benutzername
3. **Passwort**: App-Passwort (empfohlen) oder normales Passwort

**Sicherheit**: Verwenden Sie App-Passwörter:
- Nextcloud → Einstellungen → Sicherheit → App-Passwörter
- Erstellen Sie ein neues App-Passwort für n8n


## **KI-Agent Usage Examples**

### Spalte für KI-Agents erstellen
```javascript
{
  "resource": "Spalte",
  "operation": "Spalte Erstellen (KI-Friendly)",
  "tableIdAI": "123",
  "columnType": "selection",
  "columnTitle": "Projekt-Status",
  "columnDescription": "Aktueller Status des Projekts",
  "columnMandatory": true,
  "selectionOptionsAI": "[\"Geplant\", \"In Arbeit\", \"Testing\", \"Fertig\", \"Archiviert\"]",
  "selectionDefaultAI": "Geplant",
  "selectionMultipleAI": false
}
```

### Spalte für KI-Agents aktualisieren
```javascript
{
  "resource": "Spalte",
  "operation": "Spalte Aktualisieren (KI-Friendly)",
  "columnIdAI": "456",
  "columnTitle": "Erweiterte Projekt-Status",
  "selectionOptionsAI": "[\"Backlog\", \"Sprint\", \"Review\", \"Done\", \"Cancelled\"]",
  "selectionDefaultAI": "Backlog"
}
```

### Verschiedene Spaltentypen für KI-Agents
```javascript
// Text-Spalte erstellen
{
  "columnType": "text",
  "columnTitle": "Beschreibung",
  "textSubtypeAI": "long",
  "textMaxLengthAI": 1000,
  "textPatternAI": "^[A-Za-z0-9\\s]+$"
}

// Zahlen-Spalte erstellen
{
  "columnType": "number",
  "columnTitle": "Budget",
  "numberMinAI": 0,
  "numberMaxAI": 100000,
  "numberDecimalsAI": 2,
  "numberPrefixAI": "€"
}

// Benutzer/Gruppen-Spalte erstellen
{
  "columnType": "usergroup",
  "columnTitle": "Zuständig",
  "usergroupTypeAI": "user",
  "usergroupMultipleAI": false
}
```

### Human vs. KI-Agent Vergleich
```javascript
// HUMAN (UI-optimiert) - Parameter erscheinen dynamisch
Operation: "Spalte Erstellen"
Tabelle: [Dropdown-Auswahl]
Typ: "Auswahl"
// → Dann erscheinen Auswahl-spezifische Parameter

// KI-AGENT (AI-optimiert) - Alle Parameter sichtbar
Operation: "Spalte Erstellen (KI-Friendly)"
// → ALLE 23 Parameter sofort sichtbar und verwendbar
// → String-basierte Eingaben statt Dropdown-Listen
// → Maximale Flexibilität für autonome Ausführung
```

## 🔧 **Advanced Usage**

### Erweiterte Zeilen-Abfrage mit Filtern
```javascript
{
  "resource": "Zeile",
  "operation": "Alle Zeilen Abrufen",
  "source": "table",
  "tableId": "123",
  "useFiltering": true,
  "filters": [
    {
      "columnId": "5",
      "operator": "EQ",
      "value": "Aktiv"
    },
    {
      "columnId": "8",
      "operator": "GT",
      "value": "2024-01-01"
    }
  ],
  "useSorting": true,
  "sorting": [
    {
      "columnId": "10",
      "direction": "DESC"
    }
  ]
}
```

### CSV-Import mit Column-Mapping
```javascript
{
  "resource": "Import",
  "operation": "CSV in Tabelle Importieren",
  "tableId": "123",
  "csvData": "[Binary CSV Data]",
  "hasHeader": true,
  "delimiter": ";",
  "columnMapping": [
    {
      "csvColumn": "Kundenname",
      "tableColumn": "1",
      "dataType": "text"
    },
    {
      "csvColumn": "Erstellungsdatum",
      "tableColumn": "2",
      "dataType": "datetime"
    }
  ]
}
```

## **Vollständige API-Abdeckung**

### **Kompatibilität**
- **Nextcloud**: 31 (getestet)
- **Tables App**: 1.0.3 (getestet)
- **n8n**: 2.11 (getestet)

### **Technische Details**
- **API Version**: Hybrid v1/v2 (optimal je nach Operation)
- **Authentifizierung**: Basic Auth mit App-Passwort-Support
- **Error Handling**: 10 HTTP-Status-Codes mit spezifischen Meldungen
- **Retry Logic**: 3 Versuche mit exponentiellem Backoff
- **Validation**: Spalten-basierte Echtzeit-Validierung


## Development & Testing

### Setup
```bash
npm install          # Dependencies
npm run build        # TypeScript kompilieren
npm run dev          # Development-Modus
npm run lint         # Code-Prüfung
npm run format       # Code formatieren
```

### Projekt-Architektur
```
nodes/NextcloudTables/
├── NextcloudTables.node.ts              # Haupt-Node
├── descriptions/                        # UI-Definitionen
│   ├── column.ts     ← KI-OPTIMIERT
│   ├── table.ts      ├── row.ts
│   ├── view.ts       ├── share.ts
│   ├── import.ts     └── context.ts
├── handlers/                           # Business Logic
│   ├── column.handler.ts ← KI-FRIENDLY LOGIC
│   └── *.handler.ts
├── helpers/                           # Core Utilities
│   ├── api.helper.ts                  # HTTP + Error Handling
│   ├── data.formatter.ts              # Validation
│   └── node.methods.ts                # Dynamic Dropdowns
└── interfaces/                        # TypeScript Types
```


## Lizenz

MIT


## Support

- **GitHub**: [Issues & Discussions](https://github.com/terschawebIT/n8n-nodes-nextcloud-tables)
- **n8n Community**: [Community Forum](https://community.n8n.io/)
- **Documentation**: [Nextcloud Tables API](https://github.com/nextcloud/tables/blob/main/docs/API.md)
