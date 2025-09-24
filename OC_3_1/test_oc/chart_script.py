import plotly.graph_objects as go
import json

# Parse the JSON data
data_json = {"architectures": [{"name": "Монолитная", "performance": 5, "security": 3, "development_complexity": 3, "scalability": 2}, {"name": "Микроядерная", "performance": 3, "security": 5, "development_complexity": 4, "scalability": 5}, {"name": "Гибридная", "performance": 4, "security": 4, "development_complexity": 5, "scalability": 4}]}

architectures = data_json["architectures"]

# Extract data for the chart
arch_names = [arch["name"] for arch in architectures]
performance = [arch["performance"] for arch in architectures]
security = [arch["security"] for arch in architectures]
dev_complexity = [arch["development_complexity"] for arch in architectures]
scalability = [arch["scalability"] for arch in architectures]

# Create the grouped bar chart
fig = go.Figure()

# Add bars for each parameter
fig.add_trace(go.Bar(
    name='Performance',
    x=arch_names,
    y=performance,
    marker_color='#1FB8CD'
))

fig.add_trace(go.Bar(
    name='Security',
    x=arch_names,
    y=security,
    marker_color='#DB4545'
))

fig.add_trace(go.Bar(
    name='Dev Complexity',
    x=arch_names,
    y=dev_complexity,
    marker_color='#2E8B57'
))

fig.add_trace(go.Bar(
    name='Scalability',
    x=arch_names,
    y=scalability,
    marker_color='#5D878F'
))

# Update layout
fig.update_layout(
    title='OS Architecture Comparison',
    xaxis_title='Architecture',
    yaxis_title='Score (1-5)',
    barmode='group',
    legend=dict(orientation='h', yanchor='bottom', y=1.05, xanchor='center', x=0.5)
)

# Update y-axis to show scale from 1 to 5
fig.update_yaxes(range=[0, 5.5], dtick=1)

# Update traces for better display
fig.update_traces(cliponaxis=False)

# Save as PNG and SVG
fig.write_image("os_architecture_comparison.png")
fig.write_image("os_architecture_comparison.svg", format="svg")

fig.show()