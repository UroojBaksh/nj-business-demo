import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import json
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)

class NJBusinessRegistrationFunnel:
    """Generate synthetic user data simulating NJ Business Portal registration funnel"""
    
    def __init__(self, total_users=1000, date_range_days=150):
        self.total_users = total_users
        self.date_range_days = date_range_days
        self.funnel_data = {}
        self.user_data = []
        
    def generate_synthetic_users(self):
        """Generate synthetic users with different drop-off points"""
        
        stages = {
            'started_registration': 1.0,      # 100% start
            'completed_step_1': 0.75,         # 75% complete business type selection
            'completed_step_2': 0.65,         # 65% complete business info (EIN, county)
            'completed_step_3': 0.52,         # 52% complete owner info
            'verification_attempted': 0.48,   # 48% go to state portal
            'verification_completed': 0.38,   # 38% complete verification
            'permit_application_started': 0.35,  # 35% start permit application
            'permit_selected': 0.28,          # 28% select a permit
            'checkout_reached': 0.22,         # 22% reach checkout
            'order_completed': 0.18           # 18% complete order (conversion)
        }
        
        # Calculate actual user counts at each stage
        for stage, conversion_rate in stages.items():
            count = int(self.total_users * conversion_rate)
            self.funnel_data[stage] = count
        
        # Generate user events
        for i in range(self.total_users):
            user_id = f"USER_{i:05d}"
            
            # Random business type
            business_types = ['LLC', 'Corporation', 'NonProfit', 'SoleProprietor']
            business_type = np.random.choice(business_types, p=[0.45, 0.35, 0.12, 0.08])
            
            # Random dates within range
            days_ago = np.random.randint(0, self.date_range_days)
            event_date = datetime.now() - timedelta(days=days_ago)
            
            # Determine which stages this user completes
            stages_completed = self._determine_drop_off_point(i)
            
            # Create event record
            for stage in stages_completed:
                self.user_data.append({
                    'user_id': user_id,
                    'event': stage,
                    'business_type': business_type,
                    'event_date': event_date,
                    'day_of_week': event_date.strftime('%A'),
                    'timestamp': event_date.isoformat()
                })
        
        return pd.DataFrame(self.user_data)
    
    def _determine_drop_off_point(self, user_index):
        """Determine where user drops off in funnel"""
        
        # Define drop-off probabilities (higher index = more likely to drop off early)
        drop_off_probabilities = {
            'started_registration': 1.0,
            'completed_step_1': 0.75,
            'completed_step_2': 0.65,
            'completed_step_3': 0.52,
            'verification_attempted': 0.48,
            'verification_completed': 0.38,
            'permit_application_started': 0.35,
            'permit_selected': 0.28,
            'checkout_reached': 0.22,
            'order_completed': 0.18
        }
        
        stages_list = list(drop_off_probabilities.keys())
        stages_completed = ['started_registration']  # Everyone starts
        
        # For each subsequent stage, decide if user continues
        for i, stage in enumerate(stages_list[1:], 1):
            if np.random.random() < drop_off_probabilities[stage]:
                stages_completed.append(stage)
            else:
                break  # User drops off at this point
        
        return stages_completed
    
    def calculate_metrics(self):
        """Calculate key metrics and drop-off rates"""
        
        metrics = {}
        stages = list(self.funnel_data.keys())
        
        for i, stage in enumerate(stages):
            count = self.funnel_data[stage]
            
            if i == 0:
                rate = 100.0
            else:
                prev_count = self.funnel_data[stages[i-1]]
                rate = (count / prev_count * 100) if prev_count > 0 else 0
            
            # Calculate drop-off (difference from previous stage)
            drop_off = self.funnel_data[stages[i-1]] - count if i > 0 else 0
            
            metrics[stage] = {
                'count': count,
                'overall_rate': (count / self.total_users * 100),
                'drop_off': drop_off,
                'step_conversion': rate
            }
        
        return metrics
    
    def identify_opportunities(self):
        """Identify biggest drop-off points and opportunities"""
        
        stages = list(self.funnel_data.keys())
        opportunities = []
        
        for i in range(1, len(stages)):
            prev_count = self.funnel_data[stages[i-1]]
            curr_count = self.funnel_data[stages[i]]
            drop_off = prev_count - curr_count
            drop_off_rate = (drop_off / prev_count * 100) if prev_count > 0 else 0
            
            opportunities.append({
                'stage': f"{stages[i-1]} → {stages[i]}",
                'drop_off_count': drop_off,
                'drop_off_rate': drop_off_rate,
                'opportunity_revenue': drop_off * 125  # Assuming $125 avg permit value
            })
        
        # Sort by drop-off count (biggest opportunities first)
        opportunities = sorted(opportunities, key=lambda x: x['drop_off_count'], reverse=True)
        return opportunities[:5]  # Top 5 opportunities
    
    def generate_report(self):
        """Generate full analysis report"""
        
        df = self.generate_synthetic_users()
        metrics = self.calculate_metrics()
        opportunities = self.identify_opportunities()
        
        print("="*80)
        print("NJ BUSINESS PORTAL - REGISTRATION FUNNEL ANALYSIS")
        print("="*80)
        print(f"\nAnalysis Period: Last {self.date_range_days} Days")
        print(f"Total Registration Starts: {self.total_users}")
        print(f"Overall Conversion Rate: {metrics['order_completed']['overall_rate']:.2f}%")
        print(f"Revenue Opportunity (Completed Orders): ${metrics['order_completed']['count'] * 125:,.0f}")
        
        print("\n" + "="*80)
        print("FUNNEL BREAKDOWN")
        print("="*80)
        
        for stage, data in metrics.items():
            print(f"\n{stage.upper()}")
            print(f"  Users: {data['count']:>4} | Overall %: {data['overall_rate']:>6.2f}% | Step Conversion: {data['step_conversion']:>6.2f}%")
            if data['drop_off'] > 0:
                drop_off_pct = (data['drop_off'] / self.total_users) * 100
                print(f"  ⚠️  Drop-off: {data['drop_off']} users ({drop_off_pct:.1f}%)")
        
        print("\n" + "="*80)
        print("TOP OPPORTUNITIES (BIGGEST DROP-OFF POINTS)")
        print("="*80)
        
        for i, opp in enumerate(opportunities, 1):
            print(f"\n{i}. {opp['stage']}")
            print(f"   Drop-off: {opp['drop_off_count']} users ({opp['drop_off_rate']:.1f}%)")
            print(f"   Potential Revenue Impact: ${opp['opportunity_revenue']:,.0f}")
        
        print("\n" + "="*80)
        print("BUSINESS RECOMMENDATIONS")
        print("="*80)
        
        # Find biggest drop-offs and provide recommendations
        if opportunities[0]['drop_off_rate'] > 20:
            print("\n1. 🎯 OPTIMIZE STEP 1 & 2 EXPERIENCE")
            print(f"   • {opportunities[0]['drop_off_count']} users drop off ({opportunities[0]['drop_off_rate']:.1f}%)")
            print("   • Simplify business type selection - consider default recommendations")
            print("   • Add progress indicator showing '2 min to complete'")
            print(f"   • Potential revenue impact: ${opportunities[0]['opportunity_revenue']:,.0f}")
        
        if opportunities[1]['drop_off_rate'] > 15:
            print("\n2. 📧 IMPROVE VERIFICATION EXPERIENCE")
            print(f"   • {opportunities[1]['drop_off_count']} users drop off ({opportunities[1]['drop_off_rate']:.1f}%)")
            print("   • Send verification completion reminders via email")
            print("   • Simplify state portal flow - reduce clicks needed")
            print(f"   • Potential revenue impact: ${opportunities[1]['opportunity_revenue']:,.0f}")
        
        if opportunities[2]['drop_off_rate'] > 10:
            print("\n3. 💳 STREAMLINE CHECKOUT PROCESS")
            print(f"   • {opportunities[2]['drop_off_count']} users drop off ({opportunities[2]['drop_off_rate']:.1f}%)")
            print("   • Show security badges and estimated processing time")
            print("   • Enable guest checkout (no account required)")
            print(f"   • Potential revenue impact: ${opportunities[2]['opportunity_revenue']:,.0f}")
        
        print("\n" + "="*80)
        print("NEXT STEPS")
        print("="*80)
        print("\n1. A/B test copy improvements on Step 1 (EIN field)")
        print("2. Add email reminders for users who abandon at verification stage")
        print("3. Implement guest checkout option")
        print("4. Monitor these metrics weekly in GA4 dashboard")
        
        print("\n" + "="*80)
        
        return {
            'dataframe': df,
            'metrics': metrics,
            'opportunities': opportunities
        }

# Run analysis
if __name__ == "__main__":
    funnel = NJBusinessRegistrationFunnel(total_users=1000, date_range_days=150)
    result = funnel.generate_report()
    
    # Export data for visualization
    df = result['dataframe']
    df.to_csv('synthetic_funnel_data.csv', index=False)
    print("\n✅ Data exported to synthetic_funnel_data.csv")
