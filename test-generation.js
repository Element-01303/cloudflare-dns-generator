// Test script to debug the exact bash output
const testRecord = {
    name: "test.example.com",
    type: "A", 
    proxied: true
};

const recordNum = 1;
const proxied = testRecord.proxied ? 'true' : 'false';
const recordName = testRecord.name.replace(/"/g, '\\"');
const recordType = testRecord.type.replace(/"/g, '\\"');

const recordUpdate = `
# Record ${recordNum}: ${testRecord.name}
echo "Updating ${testRecord.name}..."
RECORD_ID_${recordNum}=$(get_dns_record_id "${recordName}")

if [ "$RECORD_ID_${recordNum}" != "null" ] && [ "$RECORD_ID_${recordNum}" != "" ]
then
    CURRENT_IP_${recordNum}=$(get_current_ip "$RECORD_ID_${recordNum}")
    if [ "$IP" != "$CURRENT_IP_${recordNum}" ]
    then
        update_dns_record "$RECORD_ID_${recordNum}" "${recordName}" "${recordType}" "${proxied}"
    else
        echo "→ ${testRecord.name} already has IP $IP"
    fi
else
    echo "✗ DNS record not found: ${testRecord.name}"
fi

`;

console.log("Generated record update:");
console.log(recordUpdate);
console.log("Length:", recordUpdate.length);
console.log("Lines:", recordUpdate.split('\n').length);