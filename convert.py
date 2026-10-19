import re
import os

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract body content (between <body> and <script)
body_match = re.search(r'<body>(.*?)<script', html, re.DOTALL)
if not body_match:
    print("Could not find body")
    exit()

body = body_match.group(1)

# Replace class= with className=
body = body.replace('class=', 'className=')
body = body.replace('for=', 'htmlFor=')

# Handle self-closing tags (img, input, br, hr)
body = re.sub(r'<img([^>]*?)(?<!/)>', r'<img\1 />', body)
body = re.sub(r'<input([^>]*?)(?<!/)>', r'<input\1 />', body)
body = re.sub(r'<br([^>]*?)(?<!/)>', r'<br\1 />', body)
body = re.sub(r'<hr([^>]*?)(?<!/)>', r'<hr\1 />', body)

# Replace HTML comments
body = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', body, flags=re.DOTALL)

# Inline styles if any (not much in this template)
body = re.sub(r'style="(.*?)"', '', body) # just strip inline styles for simplicity since they might break JSX if not parsed

jsx = f"""import React, {{ useState, useEffect }} from 'react';
import axios from 'axios';
import './style.css';
import './home.css';

function App() {{
    return (
        <div className="app-container">
            {body}
        </div>
    );
}}

export default App;
"""

with open('frontend/src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(jsx)

print("App.jsx created successfully")
