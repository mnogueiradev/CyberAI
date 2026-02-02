import pandas as pd
import xml.etree.ElementTree as ET
from pathlib import Path

# Caminhos
raw_path = Path("Data/Raw")
xml_file = raw_path / "scan.xml"
csv_file = raw_path / "scan.csv"

# Ler o XML do Nmap
tree = ET.parse(xml_file)
root = tree.getroot()

data = []
for host in root.findall('host'):
    ip_elem = host.find('address')
    if ip_elem is not None:
        ip = ip_elem.attrib.get('addr')
    else:
        continue

    for port in host.findall('.//port'):
        port_id = port.attrib.get('portid')
        state = port.find('state').attrib.get('state')
        service = port.find('service').attrib.get('name', 'unknown')
        data.append({'host': ip, 'port': port_id, 'state': state, 'service': service})

# Converter para DataFrame
df = pd.DataFrame(data)
df.to_csv(csv_file, index=False)

print(f"✅ Arquivo Nmap salvo em: {csv_file}")
print(df.head())
