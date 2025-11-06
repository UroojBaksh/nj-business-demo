import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch, Circle
import numpy as np


def create_better_flow_chart():
    """
    Create a horizontal left-to-right flow chart showing user journey
    Much cleaner and easier to understand
    """

    fig, ax = plt.subplots(figsize=(18, 10))
    ax.set_xlim(-1, 20)
    ax.set_ylim(-1, 10)
    ax.axis('off')

    # Title
    fig.suptitle(
        'NJ Business Portal Registration Flow - Where Users Drop Off\n18% Conversion Rate | $81K Annual Revenue Opportunity',
        fontsize=18, fontweight='bold', y=0.98)

    # Define stages with positions
    stages = [
        {
            'x': 1,
            'name': 'Landing\nPage',
            'users': 1000,
            'pct': 100,
            'color': '#4CAF50',
            'drop_off': None
        },
        {
            'x': 3,
            'name': 'Step 1\nBusiness Type',
            'users': 750,
            'pct': 75,
            'color': '#4CAF50',
            'drop_off': {'users': 250, 'pct': 25, 'reason': 'Unclear options'}
        },
        {
            'x': 5,
            'name': 'Step 2\nBusiness Info',
            'users': 650,
            'pct': 65,
            'color': '#4CAF50',
            'drop_off': {'users': 100, 'pct': 13, 'reason': 'Form complexity'}
        },
        {
            'x': 7,
            'name': 'Step 3\nOwner Info',
            'users': 520,
            'pct': 52,
            'color': '#4CAF50',
            'drop_off': {'users': 130, 'pct': 20, 'reason': 'Form fatigue'}
        },
        {
            'x': 9,
            'name': 'State\nVerification',
            'users': 480,
            'pct': 48,
            'color': '#FF9800',  # Orange = risk
            'drop_off': {'users': 100, 'pct': 21, 'reason': 'Cross-domain friction'}
        },
        {
            'x': 11,
            'name': 'Verification\nComplete',
            'users': 380,
            'pct': 38,
            'color': '#4CAF50',
            'drop_off': {'users': 100, 'pct': 26, 'reason': 'Unclear next step'}
        },
        {
            'x': 13,
            'name': 'Select\nPermit',
            'users': 280,
            'pct': 28,
            'color': '#4CAF50',
            'drop_off': {'users': 60, 'pct': 21, 'reason': 'Too many options'}
        },
        {
            'x': 15,
            'name': 'Payment\nCheckout',
            'users': 220,
            'pct': 22,
            'color': '#4CAF50',
            'drop_off': {'users': 40, 'pct': 18, 'reason': 'Payment hesitation'}
        },
        {
            'x': 17,
            'name': 'Order\nConfirmed',
            'users': 180,
            'pct': 18,
            'color': '#2196F3',  # Blue = success
            'drop_off': None
        }
    ]

    # Draw the flow from left to right
    for i, stage in enumerate(stages):
        x = stage['x']
        users = stage['users']
        pct = stage['pct']
        name = stage['name']
        color = stage['color']

        # Draw main box (centered at y=6)
        box_height = 1.5
        box_width = 1.2

        rect = FancyBboxPatch(
            (x - box_width / 2, 6 - box_height / 2),
            box_width, box_height,
            boxstyle="round,pad=0.1",
            edgecolor='black',
            facecolor=color,
            linewidth=2.5,
            alpha=0.85
        )
        ax.add_patch(rect)

        # Add step name and numbers
        ax.text(x, 6.4, name, ha='center', va='center',
                fontsize=10, fontweight='bold', color='white')
        ax.text(x, 5.8, f"{users:,} users", ha='center', va='center',
                fontsize=9, color='white')
        ax.text(x, 5.4, f"({pct}%)", ha='center', va='center',
                fontsize=8, color='white', style='italic')

        # Draw arrow to next stage
        if i < len(stages) - 1:
            next_x = stages[i + 1]['x']
            arrow = FancyArrowPatch(
                (x + box_width / 2 + 0.1, 6),
                (next_x - box_width / 2 - 0.1, 6),
                arrowstyle='->', mutation_scale=25, linewidth=2.5, color='#333333'
            )
            ax.add_patch(arrow)

        # Draw drop-off indicator BELOW the stage
        if stage['drop_off']:
            drop_off = stage['drop_off']
            drop_users = drop_off['users']
            drop_pct = drop_off['pct']
            reason = drop_off['reason']

            # Draw drop-off box below
            drop_box_height = 1.0
            drop_rect = FancyBboxPatch(
                (x - box_width / 2, 3.8 - drop_box_height),
                box_width, drop_box_height,
                boxstyle="round,pad=0.08",
                edgecolor='#F44336',
                facecolor='#FFEBEE',
                linewidth=2,
                linestyle='dashed'
            )
            ax.add_patch(drop_rect)

            # Draw arrow DOWN from main box to drop-off box
            down_arrow = FancyArrowPatch(
                (x, 6 - box_height / 2 - 0.05),
                (x, 3.8 - 0.05),
                arrowstyle='->', mutation_scale=15, linewidth=1.5,
                color='#F44336', linestyle='dashed'
            )
            ax.add_patch(down_arrow)

            # Add drop-off text
            ax.text(x, 3.5, f"-{drop_users}", ha='center', va='center',
                    fontsize=9, fontweight='bold', color='#F44336')
            ax.text(x, 3.1, f"({drop_pct}%)", ha='center', va='center',
                    fontsize=8, color='#F44336')
            ax.text(x, 2.6, reason, ha='center', va='center',
                    fontsize=7, color='#F44336', style='italic', wrap=True)

            # Add "$XX revenue" impact
            revenue_impact = drop_users * 125
            ax.text(x, 2.1, f"${revenue_impact:,.0f}", ha='center', va='center',
                    fontsize=8, fontweight='bold', color='#E53935',
                    bbox=dict(boxstyle='round,pad=0.3', facecolor='#FFF9C4', alpha=0.7))

    # Add conversion rate annotation
    ax.text(1, 8.5, '100% START', ha='center', fontsize=9, color='#1976D2', fontweight='bold')
    ax.text(17, 8.5, '18% CONVERT', ha='center', fontsize=9, color='#D32F2F', fontweight='bold')

    # Draw horizontal line showing the "success path"
    ax.plot([1.7, 17.3], [6, 6], 'k--', linewidth=1, alpha=0.3)

    # Add legend
    legend_elements = [
        mpatches.Patch(facecolor='#4CAF50', edgecolor='black', label='User Progressing'),
        mpatches.Patch(facecolor='#FF9800', edgecolor='black', label='Risk Zone (Cross-domain)'),
        mpatches.Patch(facecolor='#2196F3', edgecolor='black', label='Conversion (Success)'),
        mpatches.Patch(facecolor='#FFEBEE', edgecolor='#F44336', label='Drop-off Point (Abandonment)',
                       linestyle='dashed'),
    ]
    ax.legend(handles=legend_elements, loc='upper right', fontsize=10, framealpha=0.95)

    # Add summary insights box
    insights = (
        "KEY FINDINGS:\n\n"
        "🔴 BIGGEST OPPORTUNITIES:\n"
        "1. Step 1 (25% drop) → $31K/month lost\n"
        "2. Step 3 (20% drop) → $16K/month lost  \n"
        "3. Verification (21% drop) → $12K/month lost\n\n"
        "💡 QUICK WINS:\n"
        "• Add progress indicator ('5 min to complete')\n"
        "• Simplify business type selection\n"
        "• Show verification success animations\n\n"
        "💰 REVENUE IMPACT:\n"
        "Fix top 3 issues → Convert 18% → 24%\n"
        "= +$81K/year potential revenue"
    )

    ax.text(9.5, 0.5, insights, ha='center', va='top', fontsize=8.5, family='monospace',
            bbox=dict(boxstyle='round,pad=0.8', facecolor='#E3F2FD', edgecolor='#1976D2', linewidth=2),
            linespacing=1.6)

    plt.tight_layout()
    return fig


if __name__ == "__main__":
    fig = create_better_flow_chart()
    fig.savefig('nj_funnel_flow_better.png', dpi=300, bbox_inches='tight')
    print("✅ Better flow chart saved: nj_funnel_flow_better.png")
    print("\nThis shows:")
    print("  • Left-to-right user journey")
    print("  • Drop-offs shown BELOW each stage")
    print("  • Revenue impact for each drop-off")
    print("  • Color coding: Green (continuing), Orange (risk), Blue (success)")
    print("  • Much cleaner and easier to understand!")
    plt.show()