// Application state
let appState = {
  apiToken: '',
  domain: '',
  zoneId: '',
  records: [],
  isValidated: false,
  theme: localStorage.getItem('theme') || (localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light')
};

// DOM elements
const elements = {
  apiToken: document.getElementById('api-token'),
  domain: document.getElementById('domain'),
  validateConfig: document.getElementById('validate-config'),
  validationStatus: document.getElementById('validation-status'),
  addRecord: document.getElementById('add-record'),
  recordsContainer: document.getElementById('records-container'),
  recordCount: document.getElementById('record-count'),
  generateScript: document.getElementById('generate-script'),
  previewModal: document.getElementById('preview-modal'),
  scriptContent: document.getElementById('script-content'),
  scriptFormat: document.getElementById('script-format'),
  closePreview: document.getElementById('close-preview'),
  copyScript: document.getElementById('copy-script'),
  saveScript: document.getElementById('save-script'),
  loadingOverlay: document.getElementById('loading-overlay'),
  loadingText: document.getElementById('loading-text'),
  themeToggle: document.getElementById('theme-toggle'),
  toggleTokenVisibility: document.getElementById('toggle-token-visibility')
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  initializeApp();
  bindEventListeners();
  applyTheme();
});

function initializeApp() {
  updateRecordCount();
  
  // Set up menu listeners
  window.electronAPI.onMenuNewProject(() => {
    if (confirm('Are you sure you want to start a new project? All current data will be lost.')) {
      resetApp();
    }
  });
  
  window.electronAPI.onMenuSaveScript(() => {
    if (appState.records.length > 0 && appState.isValidated) {
      generateAndShowScript();
    }
  });
  
  window.electronAPI.onToggleDarkMode(() => {
    toggleTheme();
  });
}

function bindEventListeners() {
  // Configuration
  elements.validateConfig.addEventListener('click', validateConfiguration);
  elements.toggleTokenVisibility.addEventListener('click', toggleTokenVisibility);
  
  // Records management
  elements.addRecord.addEventListener('click', addRecord);
  
  // Script generation
  elements.generateScript.addEventListener('click', generateAndShowScript);
  
  // Modal controls
  elements.closePreview.addEventListener('click', closePreview);
  elements.scriptFormat.addEventListener('change', updateScriptPreview);
  elements.copyScript.addEventListener('click', copyScriptToClipboard);
  elements.saveScript.addEventListener('click', saveScriptToFile);
  
  // Theme toggle
  elements.themeToggle.addEventListener('click', toggleTheme);
  
  // Close modal on background click
  elements.previewModal.addEventListener('click', (e) => {
    if (e.target === elements.previewModal) {
      closePreview();
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(e) {
  if (e.ctrlKey || e.metaKey) {
    switch (e.key) {
      case 'n':
        e.preventDefault();
        if (confirm('Start a new project?')) resetApp();
        break;
      case 's':
        e.preventDefault();
        if (appState.records.length > 0 && appState.isValidated) {
          generateAndShowScript();
        }
        break;
    }
  }
  
  if (e.key === 'Escape') {
    closePreview();
  }
}

async function validateConfiguration() {
  const apiToken = elements.apiToken.value.trim();
  const domain = elements.domain.value.trim();
  
  if (!apiToken || !domain) {
    showStatus('Please enter both API token and domain', 'error');
    return;
  }
  
  showLoading('Validating configuration...');
  
  try {
    const result = await window.electronAPI.validateCloudflareApi({ apiToken, domain });
    
    if (result.success) {
      appState.apiToken = apiToken;
      appState.domain = domain;
      appState.zoneId = result.zoneId;
      appState.isValidated = true;
      
      showStatus(`Configuration validated successfully! Found ${result.records.length} existing DNS records.`, 'success');
      elements.addRecord.disabled = false;
      elements.generateScript.disabled = false;
      
      // Clear existing records and show empty state
      appState.records = [];
      updateRecordsDisplay();
    } else {
      showStatus(`Validation failed: ${result.error}`, 'error');
      resetValidation();
    }
  } catch (error) {
    showStatus(`Validation error: ${error.message}`, 'error');
    resetValidation();
  } finally {
    hideLoading();
  }
}

function resetValidation() {
  appState.isValidated = false;
  appState.zoneId = '';
  elements.addRecord.disabled = true;
  elements.generateScript.disabled = true;
}

function addRecord() {
  if (appState.records.length >= 20) {
    alert('Maximum of 20 DNS records allowed');
    return;
  }
  
  const recordId = Date.now().toString();
  const newRecord = {
    id: recordId,
    name: '',
    type: 'A',
    proxied: true
  };
  
  appState.records.push(newRecord);
  updateRecordsDisplay();
}

function removeRecord(recordId) {
  appState.records = appState.records.filter(record => record.id !== recordId);
  updateRecordsDisplay();
}

function updateRecordsDisplay() {
  const container = elements.recordsContainer;
  
  if (appState.records.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>No DNS records added yet. Click "Add Record" to get started.</p></div>';
  } else {
    container.innerHTML = '';
    appState.records.forEach((record, index) => {
      const recordElement = createRecordElement(record, index + 1);
      container.appendChild(recordElement);
    });
  }
  
  updateRecordCount();
  updateGenerateButton();
}

function createRecordElement(record, index) {
  const template = document.getElementById('record-template');
  const recordElement = template.content.cloneNode(true);
  
  // Set record number
  recordElement.querySelector('.record-number').textContent = `Record ${index}`;
  
  // Get form elements
  const subdomainInput = recordElement.querySelector('.record-subdomain');
  const domainSuffix = recordElement.querySelector('.domain-suffix');
  const typeSelect = recordElement.querySelector('.record-type');
  const proxiedCheckbox = recordElement.querySelector('.record-proxied');
  const removeButton = recordElement.querySelector('.remove-record');
  
  // Set domain suffix display
  domainSuffix.textContent = '.' + appState.domain;
  
  // Extract subdomain from existing record name if present
  let subdomain = record.subdomain || '';
  if (record.name && !record.subdomain) {
    // If we have a full name but no subdomain, extract it
    if (record.name === appState.domain) {
      subdomain = '@';
    } else if (record.name.endsWith('.' + appState.domain)) {
      subdomain = record.name.replace('.' + appState.domain, '');
    } else {
      subdomain = record.name;
    }
    record.subdomain = subdomain;
  }
  
  // Set current values
  subdomainInput.value = subdomain;
  typeSelect.value = record.type;
  proxiedCheckbox.checked = record.proxied;
  
  // Bind event listeners
  subdomainInput.addEventListener('input', (e) => {
    const subdomainValue = e.target.value.trim();
    record.subdomain = subdomainValue;
    
    // Auto-generate FQDN
    if (subdomainValue === '@' || subdomainValue === '') {
      record.name = appState.domain;
    } else {
      record.name = subdomainValue + '.' + appState.domain;
    }
    updateGenerateButton();
  });
  
  typeSelect.addEventListener('change', (e) => {
    record.type = e.target.value;
  });
  
  proxiedCheckbox.addEventListener('change', (e) => {
    record.proxied = e.target.checked;
  });
  
  removeButton.addEventListener('click', () => {
    removeRecord(record.id);
  });
  
  return recordElement;
}

function updateRecordCount() {
  elements.recordCount.textContent = appState.records.length;
}

function updateGenerateButton() {
  const hasValidRecords = appState.records.length > 0 && 
                         appState.records.every(record => record.name.trim() !== '');
  elements.generateScript.disabled = !appState.isValidated || !hasValidRecords;
}

async function generateAndShowScript() {
  showLoading('Generating script...');
  
  try {
    const script = generateScript(elements.scriptFormat.value);
    elements.scriptContent.textContent = script;
    elements.previewModal.classList.remove('hidden');
  } catch (error) {
    showStatus(`Script generation failed: ${error.message}`, 'error');
  } finally {
    hideLoading();
  }
}

function generateScript(format) {
  const templates = {
    sh: generateBashScript,
    bat: generateBatchScript,
    ps1: generatePowerShellScript
  };
  
  const generator = templates[format];
  if (!generator) {
    throw new Error('Unsupported script format');
  }
  
  return generator();
}

function generateBashScript() {
  let script = '#!/bin/bash\n\n';
    script += '# Cloudflare DNS Update Script\n';
    script += '# Generated by Cloudflare DNS Updater\n';
  script += '# Domain: ' + appState.domain + '\n';
  script += '# Records: ' + appState.records.length + '\n';
  script += '# Generated on: ' + new Date().toISOString() + '\n\n';
  
  script += 'CLOUDFLARE_API_TOKEN="' + appState.apiToken + '"\n';
  script += 'ZONE_ID="' + appState.zoneId + '"\n\n';
  
  // Use portable command detection
  script += '# Set command paths\n';
  script += 'CURL=""\n';
  script += 'JQ=""\n\n';
  
  script += 'if command -v curl > /dev/null 2>&1; then\n';
  script += '    CURL="curl"\n';
  script += 'fi\n\n';
  
  script += 'if command -v jq > /dev/null 2>&1; then\n';
  script += '    JQ="jq"\n';
  script += 'fi\n\n';
  
  script += '# Check dependencies\n';
  script += 'if [ -z "$CURL" ]; then\n';
  script += '    echo "Error: curl not found. Please install curl."\n';
  script += '    exit 1\n';
  script += 'fi\n\n';
  
  script += 'if [ -z "$JQ" ]; then\n';
  script += '    echo "Error: jq not found. Please install jq."\n';
  script += '    exit 1\n';
  script += 'fi\n\n';
  
  // Simple IP detection
  script += '# Get current public IP\n';
  script += 'IP=$($CURL -s http://ipv4.icanhazip.com)\n';
  script += 'if [ -z "$IP" ]; then\n';
  script += '    echo "Error: Could not get public IP"\n';
  script += '    exit 1\n';
  script += 'fi\n\n';
  
  script += 'echo "Current IP: $IP"\n';
  script += 'echo "Starting DNS updates..."\n\n';
  
  // Simple DNS functions without local keyword for maximum compatibility
  script += '# Function to get DNS record ID\n';
  script += 'get_dns_record_id() {\n';
  script += '    _name="$1"\n';
  script += '    $CURL -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$_name" \\\n';
  script += '        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \\\n';
  script += '        -H "Content-Type: application/json" | $JQ -r \'.result[0].id // "null"\'\n';
  script += '}\n\n';
  
  script += '# Function to get current DNS record IP\n';
  script += 'get_current_ip() {\n';
  script += '    _id="$1"\n';
  script += '    $CURL -s -X GET "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$_id" \\\n';
  script += '        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \\\n';
  script += '        -H "Content-Type: application/json" | $JQ -r \'.result.content // ""\'\n';
  script += '}\n\n';
  
  script += '# Function to update DNS record\n';
  script += 'update_dns_record() {\n';
  script += '    _id="$1"\n';
  script += '    _name="$2"\n';
  script += '    _type="$3"\n';
  script += '    _proxied="$4"\n';
  script += '    _response=$($CURL -s -X PUT "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$_id" \\\n';
  script += '        -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \\\n';
  script += '        -H "Content-Type: application/json" \\\n';
  script += '        --data "{\\"type\\":\\"$_type\\",\\"name\\":\\"$_name\\",\\"content\\":\\"$IP\\",\\"ttl\\":1,\\"proxied\\":$_proxied}")\n';
  script += '    _success=$(echo "$_response" | $JQ -r \'.success // false\')\n';
  script += '    if [ "$_success" = "true" ]; then\n';
  script += '        echo "[OK] Updated $_name to $IP"\n';
  script += '    else\n';
  script += '        _error=$(echo "$_response" | $JQ -r \'.errors[0].message // "Unknown error"\')\n';
  script += '        echo "[FAIL] Failed to update $_name: $_error"\n';
  script += '    fi\n';
  script += '}\n\n';
  
  // Record updates with simple syntax
  script += '# Update DNS records\n';
  appState.records.forEach((record, index) => {
    const proxied = record.proxied ? 'true' : 'false';
    const recordNum = index + 1;
    const recordName = record.name.replace(/"/g, '\\"');
    const recordType = record.type.replace(/"/g, '\\"');
    
    script += '# Record ' + recordNum + ': ' + record.name + '\n';
    script += 'echo "Updating ' + record.name + '..."\n';
    script += 'RECORD_ID_' + recordNum + '=$(get_dns_record_id "' + recordName + '")\n';
    script += 'if [ "$RECORD_ID_' + recordNum + '" != "null" ] && [ -n "$RECORD_ID_' + recordNum + '" ]; then\n';
    script += '    CURRENT_IP_' + recordNum + '=$(get_current_ip "$RECORD_ID_' + recordNum + '")\n';
    script += '    if [ "$IP" != "$CURRENT_IP_' + recordNum + '" ]; then\n';
    script += '        update_dns_record "$RECORD_ID_' + recordNum + '" "' + recordName + '" "' + recordType + '" ' + proxied + '\n';
    script += '    else\n';
    script += '        echo "[SKIP] ' + record.name + ' already has IP $IP"\n';
    script += '    fi\n';
    script += 'else\n';
    script += '    echo "[FAIL] DNS record not found: ' + record.name + '"\n';
    script += 'fi\n\n';
  });
  
  script += 'echo "DNS update completed!"\n';
  
  return script;
}

function generateBatchScript() {
  const header = `@echo off
  REM Cloudflare DNS Update Script
  REM Generated by Cloudflare DNS Updater
REM Domain: ${appState.domain}
REM Records: ${appState.records.length}
REM Generated on: ${new Date().toISOString()}

set CLOUDFLARE_API_TOKEN=${appState.apiToken}
set ZONE_ID=${appState.zoneId}

REM Get current public IP
for /f %%i in ('curl -s http://ipv4.icanhazip.com') do set IP=%%i
echo Current IP: %IP%
echo Starting DNS updates...
`;

  let recordUpdates = '\nREM Update DNS records\n';
  
  appState.records.forEach((record, index) => {
    const proxied = record.proxied ? 'true' : 'false';
    const recordNum = index + 1;
    recordUpdates += `
REM Record ${recordNum}: ${record.name}
echo Updating ${record.name}...
for /f %%i in ('curl -s -X GET "https://api.cloudflare.com/client/v4/zones/%ZONE_ID%/dns_records?name=${record.name}" -H "Authorization: Bearer %CLOUDFLARE_API_TOKEN%" -H "Content-Type: application/json" ^| jq -r ".result[0].id"') do set RECORD_ID_${recordNum}=%%i

if not "%RECORD_ID_${recordNum}%"=="null" (
    for /f %%i in ('curl -s -X GET "https://api.cloudflare.com/client/v4/zones/%ZONE_ID%/dns_records/%RECORD_ID_${recordNum}%" -H "Authorization: Bearer %CLOUDFLARE_API_TOKEN%" -H "Content-Type: application/json" ^| jq -r ".result.content"') do set CURRENT_IP_${recordNum}=%%i
    
    if not "%IP%"=="%CURRENT_IP_${recordNum}%" (
        curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/%ZONE_ID%/dns_records/%RECORD_ID_${recordNum}%" -H "Authorization: Bearer %CLOUDFLARE_API_TOKEN%" -H "Content-Type: application/json" --data "{\\"type\\":\\"${record.type}\\",\\"name\\":\\"${record.name}\\",\\"content\\":\\"%IP%\\",\\"ttl\\":1,\\"proxied\\":${proxied}}" > nul
        echo Updated ${record.name} to %IP%
    ) else (
        echo ${record.name} already has IP %IP%
    )
) else (
    echo DNS record not found: ${record.name}
)
`;
  });
  
  const footer = `
echo DNS update completed!
pause
`;
  
  return header + recordUpdates + footer;
}

function generatePowerShellScript() {
  const header = `# Cloudflare DNS Update Script
  # Cloudflare DNS Update Script
  # Generated by Cloudflare DNS Updater
# Domain: ${appState.domain}
# Records: ${appState.records.length}
# Generated on: ${new Date().toISOString()}

$CLOUDFLARE_API_TOKEN = "${appState.apiToken}"
$ZONE_ID = "${appState.zoneId}"

# Get current public IP
try {
    $IP = (Invoke-RestMethod -Uri "http://ipv4.icanhazip.com").Trim()
    Write-Host "Current IP: $IP"
    Write-Host "Starting DNS updates..."
} catch {
    Write-Error "Failed to get current IP address"
    exit 1
}

# Headers for API requests
$headers = @{
    "Authorization" = "Bearer $CLOUDFLARE_API_TOKEN"
    "Content-Type" = "application/json"
}
`;

  const functions = `
# Function to get DNS record ID
function Get-DNSRecordID {
    param($recordName)
    try {
        $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records?name=$recordName" -Headers $headers -Method Get
        if ($response.success -and $response.result.Count -gt 0) {
            return $response.result[0].id
        }
        return $null
    } catch {
        Write-Warning "Failed to get record ID for $recordName"
        return $null
    }
}

# Function to get current DNS record IP
function Get-CurrentIP {
    param($recordId)
    try {
        $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$recordId" -Headers $headers -Method Get
        if ($response.success) {
            return $response.result.content
        }
        return $null
    } catch {
        Write-Warning "Failed to get current IP for record $recordId"
        return $null
    }
}

# Function to update DNS record
function Update-DNSRecord {
    param($recordId, $recordName, $recordType, $proxied)
    
    $body = @{
        type = $recordType
        name = $recordName
        content = $IP
        ttl = 1
        proxied = $proxied
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/dns_records/$recordId" -Headers $headers -Method Put -Body $body
        if ($response.success) {
            Write-Host "✓ Updated $recordName to $IP" -ForegroundColor Green
        } else {
            Write-Warning "✗ Failed to update $recordName: $($response.errors[0].message)"
        }
    } catch {
        Write-Error "✗ Failed to update $recordName: $($_.Exception.Message)"
    }
}
`;

  let recordUpdates = '\n# Update DNS records\n';
  
  appState.records.forEach((record, index) => {
    const proxied = record.proxied ? '$true' : '$false';
    const recordNum = index + 1;
    recordUpdates += `
# Record ${recordNum}: ${record.name}
Write-Host "Updating ${record.name}..."
$recordId${recordNum} = Get-DNSRecordID -recordName "${record.name}"
if ($recordId${recordNum}) {
    $currentIP${recordNum} = Get-CurrentIP -recordId $recordId${recordNum}
    if ($IP -ne $currentIP${recordNum}) {
        Update-DNSRecord -recordId $recordId${recordNum} -recordName "${record.name}" -recordType "${record.type}" -proxied ${proxied}
    } else {
        Write-Host "→ ${record.name} already has IP $IP" -ForegroundColor Yellow
    }
} else {
    Write-Warning "✗ DNS record not found: ${record.name}"
}
`;
  });
  
  const footer = `
Write-Host "DNS update completed!" -ForegroundColor Green
`;
  
  return header + functions + recordUpdates + footer;
}

function updateScriptPreview() {
  if (!elements.previewModal.classList.contains('hidden')) {
    const script = generateScript(elements.scriptFormat.value);
    elements.scriptContent.textContent = script;
  }
}

async function copyScriptToClipboard() {
  try {
    await navigator.clipboard.writeText(elements.scriptContent.textContent);
    showTempMessage(elements.copyScript, 'Copied!');
  } catch (error) {
    console.error('Failed to copy script:', error);
    showStatus('Failed to copy script to clipboard', 'error');
  }
}

async function saveScriptToFile() {
  const format = elements.scriptFormat.value;
  const scriptData = {
    content: elements.scriptContent.textContent,
    extension: format
  };
  
  try {
    const result = await window.electronAPI.saveScript(scriptData);
    if (result.success) {
      showTempMessage(elements.saveScript, 'Saved!');
    } else if (!result.canceled) {
      showStatus(`Failed to save script: ${result.error}`, 'error');
    }
  } catch (error) {
    console.error('Failed to save script:', error);
    showStatus('Failed to save script', 'error');
  }
}

function closePreview() {
  elements.previewModal.classList.add('hidden');
}

function toggleTokenVisibility() {
  const input = elements.apiToken;
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  elements.toggleTokenVisibility.textContent = isPassword ? '🙈' : '👁️';
}

function showLoading(text) {
  elements.loadingText.textContent = text;
  elements.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
  elements.loadingOverlay.classList.add('hidden');
}

function showStatus(message, type) {
  elements.validationStatus.textContent = message;
  elements.validationStatus.className = `status-message ${type}`;
}

function showTempMessage(button, message) {
  const originalText = button.textContent;
  button.textContent = message;
  button.disabled = true;
  setTimeout(() => {
    button.textContent = originalText;
    button.disabled = false;
  }, 2000);
}

function resetApp() {
  // Clear form
  elements.apiToken.value = '';
  elements.domain.value = '';
  
  // Reset state
  appState.apiToken = '';
  appState.domain = '';
  appState.zoneId = '';
  appState.records = [];
  appState.isValidated = false;
  
  // Reset UI
  elements.validationStatus.className = 'status-message';
  elements.addRecord.disabled = true;
  elements.generateScript.disabled = true;
  
  updateRecordsDisplay();
  closePreview();
}

function setTheme(theme) {
  appState.theme = theme;
  localStorage.setItem('theme', theme);
  applyTheme();
}

function toggleTheme() {
  const themes = [
    'light',
    'dark',
    'catppuccin-latte',
    'catppuccin-frappe',
    'catppuccin-macchiato',
    'catppuccin-mocha'
  ];
  const currentIndex = themes.indexOf(appState.theme);
  const nextTheme = themes[(currentIndex + 1) % themes.length];
  setTheme(nextTheme);
}

function applyTheme() {
  const body = document.body;
  const themeIcon = elements.themeToggle.querySelector('.theme-icon');

  body.classList.remove(
    'light-theme',
    'dark-theme',
    'catppuccin-latte-theme',
    'catppuccin-frappe-theme',
    'catppuccin-macchiato-theme',
    'catppuccin-mocha-theme'
  );
  body.classList.add(`${appState.theme}-theme`);

  elements.themeToggle.title = `Theme: ${formatThemeLabel(appState.theme)} (click to cycle)`;

  switch (appState.theme) {
    case 'dark':
      themeIcon.textContent = '🌙';
      break;
    case 'catppuccin-latte':
      themeIcon.textContent = '🌻';
      break;
    case 'catppuccin-frappe':
      themeIcon.textContent = '🪴';
      break;
    case 'catppuccin-macchiato':
      themeIcon.textContent = '🌺';
      break;
    case 'catppuccin-mocha':
      themeIcon.textContent = '🌿';
      break;
    default:
      themeIcon.textContent = '☀️';
  }
}

function formatThemeLabel(theme) {
  switch (theme) {
    case 'dark':
      return 'Dark';
    case 'catppuccin-latte':
      return 'Catppuccin Latte';
    case 'catppuccin-frappe':
      return 'Catppuccin Frappé';
    case 'catppuccin-macchiato':
      return 'Catppuccin Macchiato';
    case 'catppuccin-mocha':
      return 'Catppuccin Mocha';
    default:
      return 'Light';
  }
}