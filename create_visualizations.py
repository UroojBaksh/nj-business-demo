import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import numpy as np


def create_detailed_registration_funnel():
    """
    Create a detailed funnel showing the actual NJ Business Portal registration flow
    with step names, user counts, and drop-off indicators
    """

    # Registration flow stages with actual names
    stages = [
        {
            'name': 'Start Registration',
            'subtitle': 'Landing Page',
            'users': 1000,
            'color': '#4CAF50'  # Green - success path
        },
        {
            'name': 'Step 1: Select Business Type',
            'subtitle': 'LLC, Corporation, Non-Profit, etc.',
            'users': 750,
            'color': '#4CAF50',
            'drop_off': 250,
            'drop_off_reason': 'Unclear what to choose'
        },
        {
            'name': 'Step 2: Business Information',
            'subtitle': 'Legal Name, EIN, County',
            'users': 650,
            'color': '#4CAF50',
            'drop_off': 100,
            'drop_off_reason': 'Form complexity'
        },
        {
            'name': 'Step 3: Owner Information',
            'subtitle': 'Owner details, MWBE status',
            'users': 520,
            'color': '#4CAF50',
            'drop_off': 130,
            'drop_off_reason': 'Too many personal fields'
        },
        {
            'name': 'State Verification Portal',
            'subtitle': 'Cross-domain redirect',
            'users': 480,
            'color': '#FF9800',  # Orange - warning
            'drop_off': 40,
            'drop_off_reason': 'Lost in redirect'
        },
        {
            'name': 'Verification Complete',
            'subtitle': 'Data verified',
            'users': 380,
            'color': '#4CAF50',
            'drop_off': 100,
            'drop_off_reason': 'Unclear next step'
        },
        {
            'name': 'Select Permit Type',
            'subtitle': 'Choose permit category',
            'users': 280,
            'color': '#4CAF50',
            'drop_off': 70,
            'drop_off_reason': 'Too many options'
        },
        {
            'name': 'Payment & Checkout',
            'subtitle': 'Enter payment info',
            'users': 220,
            'color': '#4CAF50',
            'drop_off': 40,
            'drop_off_reason': 'Payment friction'
        },
        {
            'name': 'Order Confirmed',
            'subtitle': 'Success!',
            'users': 180,
            'color': '#2196F3'  # Blue - completion
        }
    ]

    fig, ax = plt.subplots(figsize=(14, 16))
    ax.set_xlim(-2, 10)
    ax.set_ylim(-1, len(stages) * 3 + 2)
    ax.axis('off')

    # Title
    fig.suptitle('NJ Business Portal - Complete Registration Funnel\n18% Conversion Rate | $81K Annual Opportunity',
                 fontsize=18, fontweight='bold', y=0.98)

    # Draw the funnel flow
    y_position = len(stages) * 3

    for i, stage in enumerate(stages):
        users = stage['users']
        pct = (users / stages[0]['users']) * 100
        color = stage['color']

        # Calculate box width based on user count
        width = (users / stages[0]['users']) * 6
        x_center = 5
        left_x = x_center - width / 2

        # Draw main stage box
        box = FancyBboxPatch(
            (left_x, y_position - 0.6),
            width, 1.2,
            boxstyle="round,pad=0.1",
            edgecolor='black',
            facecolor=color,
            linewidth=2.5,
            alpha=0.8
        )
        ax.add_patch(box)

        # Add text inside box
        ax.text(x_center, y_position + 0.3, stage['name'],
                ha='center', va='center', fontsize=11, fontweight='bold', color='white')
        ax.text(x_center, y_position - 0.1, stage['subtitle'],
                ha='center', va='center', fontsize=9, color='white', style='italic')

        # Add user count and percentage on the right
        ax.text(left_x - 0.5, y_position, f"{users:,}",
                ha='right', va='center', fontsize=10, fontweight='bold')
        ax.text(left_x - 0.5, y_position - 0.35, f"{pct:.0f}%",
                ha='right', va='center', fontsize=9, color='gray')

        # Draw drop-off indicator (if exists)
        if 'drop_off' in stage and stage['drop_off'] > 0:
            drop_off = stage['drop_off']
            reason = stage['drop_off_reason']

            # Draw drop-off arrow to the right
            drop_x = left_x + width + 0.3
            ax.annotate('', xy=(drop_x + 1.5, y_position - 1.2),
                        xytext=(left_x + width, y_position - 0.6),
                        arrowprops=dict(arrowstyle='->', lw=2, color='#F44336', linestyle='dashed'))

            # Draw drop-off box
            drop_box = FancyBboxPatch(
                (drop_x + 1.5, y_position - 1.5),
                1.8, 0.8,
                boxstyle="round,pad=0.05",
                edgecolor='#F44336',
                facecolor='#FFEBEE',
                linewidth=1.5,
                linestyle='dashed'
            )
            ax.add_patch(drop_box)

            ax.text(drop_x + 2.4, y_position - 1.1, f"-{drop_off}",
                    ha='center', va='center', fontsize=9, fontweight='bold', color='#F44336')

            # Add reason tooltip
            ax.text(drop_x + 2.4, y_position - 1.8, reason,
                    ha='center', va='top', fontsize=8, color='#F44336', style='italic', wrap=True)

        # Draw arrow to next stage (if not last stage)
        if i < len(stages) - 1:
            next_users = stages[i + 1]['users']
            next_width = (next_users / stages[0]['users']) * 6

            ax.annotate('', xy=(x_center, y_position - 2.2),
                        xytext=(x_center, y_position - 0.65),
                        arrowprops=dict(arrowstyle='->', lw=3, color='#333333'))

        y_position -= 3

    # Add summary box at bottom
    summary_text = (
        "KEY INSIGHTS:\n"
        "• Biggest drop-off: Step 1 (25% abandon - unclear choices)\n"
        "• Second biggest: Step 3 (20% abandon - form fatigue)\n"
        "• Third: Verification (21% abandon - cross-domain friction)\n\n"
        "REVENUE OPPORTUNITY:\n"
        "Each 1% increase in conversion = +$405/month\n"
        "Fixing top 3 issues = $81K/year potential"
    )

    summary_box = FancyBboxPatch(
        (0.5, -2), 8, 2.5,
        boxstyle="round,pad=0.2",
        edgecolor='#2196F3',
        facecolor='#E3F2FD',
        linewidth=2
    )
    ax.add_patch(summary_box)

    ax.text(5, 0.7, summary_text,
            ha='center', va='center', fontsize=9, family='monospace',
            bbox=dict(boxstyle='round', facecolor='white', alpha=0.3))

    # Add legend
    legend_elements = [
        patches.Patch(facecolor='#4CAF50', edgecolor='black', label='User Completing Stage'),
        patches.Patch(facecolor='#FF9800', edgecolor='black', label='Risk Point (Cross-domain)'),
        patches.Patch(facecolor='#2196F3', edgecolor='black', label='Conversion Goal'),
        patches.Patch(facecolor='#FFEBEE', edgecolor='#F44336', label='Abandonment Point', linestyle='dashed'),
    ]
    ax.legend(handles=legend_elements, loc='upper right', fontsize=9)

    plt.tight_layout()
    return fig


# Run it
if __name__ == "__main__":
    fig = create_detailed_registration_funnel()
    fig.savefig('nj_registration_funnel_detailed.png', dpi=300, bbox_inches='tight')
    print("✅ Detailed funnel chart saved: nj_registration_funnel_detailed.png")
    plt.close()