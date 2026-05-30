/**
 * seed_forms.js
 * Run: node scripts/seed_forms.js
 *
 * Creates default dynamic forms for all 5 solar projects.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/database.js';
import FormSchema from '../models/forms/FormSchema.js';

dotenv.config();

const DEFAULT_FORMS = [
  {
    projectSlug: 'surya-ghar-yojana',
    projectName: 'Surya Ghar Yojana',
    description: 'PM Surya Ghar Muft Bijli Yojana ke liye consumer registration form',
    fields: [
      { label: 'Full Name', fieldName: 'full_name', fieldType: 'text', placeholder: 'Apna poora naam darj karein', isRequired: true, order: 0 },
      { label: 'Mobile Number', fieldName: 'mobile_number', fieldType: 'mobile', placeholder: '10 digit mobile number', isRequired: true, order: 1 },
      { label: 'Email Address', fieldName: 'email', fieldType: 'email', placeholder: 'email@example.com', isRequired: false, order: 2 },
      { label: 'Complete Address', fieldName: 'address', fieldType: 'textarea', placeholder: 'Ghar ka poora pata darj karein', isRequired: true, order: 3 },
      { label: 'State', fieldName: 'state', fieldType: 'dropdown', isRequired: true, order: 4, options: ['Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Gujarat', 'Madhya Pradesh', 'Bihar', 'West Bengal', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh'] },
      { label: 'District', fieldName: 'district', fieldType: 'text', placeholder: 'Apna jila likhen', isRequired: true, order: 5 },
      { label: 'Aadhaar Number', fieldName: 'aadhaar_number', fieldType: 'number', placeholder: '12 digit Aadhaar number', isRequired: true, order: 6, minLength: 12, maxLength: 12 },
      { label: 'Consumer Number (Bijli)', fieldName: 'consumer_number', fieldType: 'text', placeholder: 'Bijli bill ka consumer number', isRequired: true, order: 7 },
      { label: 'Solar Capacity Required', fieldName: 'solar_capacity', fieldType: 'dropdown', isRequired: true, order: 8, options: ['1 kW', '2 kW', '3 kW', '5 kW', '10 kW', '10 kW se adhik'] },
      { label: 'Electricity Bill Upload', fieldName: 'electricity_bill', fieldType: 'file', isRequired: true, order: 9, acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { label: 'Aadhaar Card Upload', fieldName: 'aadhaar_card', fieldType: 'file', isRequired: true, order: 10, acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'] },
    ],
  },
  {
    projectSlug: 'group-solar',
    projectName: 'Group Solar',
    description: 'Group / Society solar installation ke liye registration form',
    fields: [
      { label: 'Society / Group Name', fieldName: 'group_name', fieldType: 'text', placeholder: 'Society ya group ka naam', isRequired: true, order: 0 },
      { label: 'Authorized Person Name', fieldName: 'authorized_person', fieldType: 'text', placeholder: 'Authorized person ka naam', isRequired: true, order: 1 },
      { label: 'Contact Number', fieldName: 'contact_number', fieldType: 'mobile', placeholder: '10 digit number', isRequired: true, order: 2 },
      { label: 'Email', fieldName: 'email', fieldType: 'email', placeholder: 'email@example.com', isRequired: false, order: 3 },
      { label: 'Number of Members', fieldName: 'member_count', fieldType: 'number', placeholder: 'Group mein kitne members hain', isRequired: true, order: 4, minValue: 2 },
      { label: 'Total Solar Capacity Required (kW)', fieldName: 'total_capacity_kw', fieldType: 'number', placeholder: 'e.g. 50', isRequired: true, order: 5 },
      { label: 'Location / Address', fieldName: 'location_address', fieldType: 'textarea', placeholder: 'Society ka pata', isRequired: true, order: 6 },
      { label: 'State', fieldName: 'state', fieldType: 'dropdown', isRequired: true, order: 7, options: ['Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Gujarat', 'Madhya Pradesh', 'Bihar', 'West Bengal', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh'] },
      { label: 'Property Type', fieldName: 'property_type', fieldType: 'radio', isRequired: true, order: 8, options: ['Residential Colony', 'Apartment Complex', 'Industrial Area', 'Mixed Use'] },
      { label: 'NOC Document Upload', fieldName: 'noc_document', fieldType: 'file', isRequired: false, order: 9, acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'] },
    ],
  },
  {
    projectSlug: 'village-solar-campaign',
    projectName: 'Village Solar Campaign',
    description: 'Gram Panchayat solar campaign ke liye registration',
    fields: [
      { label: 'Applicant Name', fieldName: 'applicant_name', fieldType: 'text', placeholder: 'Aavedan karne wale ka naam', isRequired: true, order: 0 },
      { label: 'Father / Husband Name', fieldName: 'father_husband_name', fieldType: 'text', placeholder: 'Pita / Pati ka naam', isRequired: true, order: 1 },
      { label: 'Village Name', fieldName: 'village_name', fieldType: 'text', placeholder: 'Apna gaon ka naam', isRequired: true, order: 2 },
      { label: 'Gram Panchayat', fieldName: 'gram_panchayat', fieldType: 'text', placeholder: 'Gram Panchayat ka naam', isRequired: true, order: 3 },
      { label: 'Block Name', fieldName: 'block_name', fieldType: 'text', placeholder: 'Block ka naam', isRequired: true, order: 4 },
      { label: 'District', fieldName: 'district', fieldType: 'text', placeholder: 'Jila', isRequired: true, order: 5 },
      { label: 'Mobile Number', fieldName: 'mobile_number', fieldType: 'mobile', placeholder: '10 digit mobile number', isRequired: true, order: 6 },
      { label: 'Category', fieldName: 'category', fieldType: 'radio', isRequired: true, order: 7, options: ['General', 'OBC', 'SC', 'ST'] },
      { label: 'Annual Income (approx)', fieldName: 'annual_income', fieldType: 'dropdown', isRequired: false, order: 8, options: ['1 lakh se kam', '1-2 lakh', '2-5 lakh', '5-10 lakh', '10 lakh se adhik'] },
      { label: 'Solar System Size', fieldName: 'solar_size', fieldType: 'dropdown', isRequired: true, order: 9, options: ['1 kW', '2 kW', '3 kW', '5 kW'] },
      { label: 'Aadhar Card', fieldName: 'aadhaar_upload', fieldType: 'file', isRequired: true, order: 10, acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { label: 'Bank Passbook / Account Details', fieldName: 'bank_document', fieldType: 'file', isRequired: true, order: 11, acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'] },
    ],
  },
  {
    projectSlug: 'commercial-solar',
    projectName: 'Commercial Solar',
    description: 'Commercial / Industrial solar installation registration',
    fields: [
      { label: 'Company / Business Name', fieldName: 'company_name', fieldType: 'text', placeholder: 'Company ya business ka naam', isRequired: true, order: 0 },
      { label: 'Contact Person Name', fieldName: 'contact_person', fieldType: 'text', placeholder: 'Contact person ka naam', isRequired: true, order: 1 },
      { label: 'Designation', fieldName: 'designation', fieldType: 'text', placeholder: 'e.g. CEO, Manager', isRequired: false, order: 2 },
      { label: 'Mobile Number', fieldName: 'mobile_number', fieldType: 'mobile', placeholder: '10 digit number', isRequired: true, order: 3 },
      { label: 'Email ID', fieldName: 'email', fieldType: 'email', placeholder: 'Business email', isRequired: true, order: 4 },
      { label: 'Business Address', fieldName: 'business_address', fieldType: 'textarea', placeholder: 'Business ka poora pata', isRequired: true, order: 5 },
      { label: 'State', fieldName: 'state', fieldType: 'dropdown', isRequired: true, order: 6, options: ['Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Gujarat', 'Madhya Pradesh', 'Bihar', 'West Bengal', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh'] },
      { label: 'Business Type', fieldName: 'business_type', fieldType: 'dropdown', isRequired: true, order: 7, options: ['Manufacturing', 'Trading', 'Service', 'Agriculture', 'Hospitality', 'Education', 'Healthcare', 'Other'] },
      { label: 'Monthly Electricity Bill (approx)', fieldName: 'monthly_bill', fieldType: 'number', placeholder: 'Amount in ₹', isRequired: true, order: 8 },
      { label: 'Required Solar Capacity (kW)', fieldName: 'solar_capacity_kw', fieldType: 'number', placeholder: 'e.g. 100', isRequired: true, order: 9 },
      { label: 'Rooftop Area Available (sq ft)', fieldName: 'rooftop_area', fieldType: 'number', placeholder: 'e.g. 5000', isRequired: false, order: 10 },
      { label: 'Connection Type', fieldName: 'connection_type', fieldType: 'radio', isRequired: true, order: 11, options: ['LT Connection', 'HT Connection'] },
      { label: 'Electricity Bill Copy', fieldName: 'electricity_bill', fieldType: 'file', isRequired: true, order: 12, acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { label: 'GST Certificate (if applicable)', fieldName: 'gst_certificate', fieldType: 'file', isRequired: false, order: 13, acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'] },
    ],
  },
  {
    projectSlug: 'residential-solar',
    projectName: 'Residential Solar',
    description: 'Ghar ke liye rooftop solar installation registration',
    fields: [
      { label: 'Full Name', fieldName: 'full_name', fieldType: 'text', placeholder: 'Apna poora naam', isRequired: true, order: 0 },
      { label: 'Mobile Number', fieldName: 'mobile_number', fieldType: 'mobile', placeholder: '10 digit number', isRequired: true, order: 1 },
      { label: 'Email ID', fieldName: 'email', fieldType: 'email', placeholder: 'email@example.com', isRequired: false, order: 2 },
      { label: 'House Address', fieldName: 'house_address', fieldType: 'textarea', placeholder: 'Ghar ka poora pata', isRequired: true, order: 3 },
      { label: 'State', fieldName: 'state', fieldType: 'dropdown', isRequired: true, order: 4, options: ['Uttar Pradesh', 'Maharashtra', 'Rajasthan', 'Gujarat', 'Madhya Pradesh', 'Bihar', 'West Bengal', 'Tamil Nadu', 'Karnataka', 'Andhra Pradesh'] },
      { label: 'District', fieldName: 'district', fieldType: 'text', placeholder: 'Apna jila', isRequired: true, order: 5 },
      { label: 'Monthly Electricity Bill (₹)', fieldName: 'monthly_bill', fieldType: 'number', placeholder: 'e.g. 2000', isRequired: true, order: 6 },
      { label: 'Required Solar Capacity', fieldName: 'solar_capacity', fieldType: 'dropdown', isRequired: true, order: 7, options: ['1 kW', '2 kW', '3 kW', '5 kW', '10 kW'] },
      { label: 'Property Type', fieldName: 'property_type', fieldType: 'radio', isRequired: true, order: 8, options: ['Independent House', 'Villa', 'Row House', 'Apartment (Ground Floor)'] },
      { label: 'Rooftop Ownership', fieldName: 'rooftop_ownership', fieldType: 'radio', isRequired: true, order: 9, options: ['Own', 'Rented', 'Shared'] },
      { label: 'Subsidy Interested?', fieldName: 'subsidy_interested', fieldType: 'checkbox', isRequired: false, order: 10, options: ['PM Surya Ghar Yojana', 'State Subsidy', 'Net Metering'] },
      { label: 'Aadhaar Number', fieldName: 'aadhaar_number', fieldType: 'number', placeholder: '12 digit Aadhaar number', isRequired: true, order: 11 },
      { label: 'Electricity Bill Upload', fieldName: 'electricity_bill', fieldType: 'file', isRequired: true, order: 12, acceptedFormats: ['.pdf', '.jpg', '.jpeg', '.png'] },
      { label: 'Expected Installation Date', fieldName: 'expected_date', fieldType: 'date', isRequired: false, order: 13 },
    ],
  },
];

async function seedForms() {
  await connectDB();
  console.log('Connected to DB');

  for (const formData of DEFAULT_FORMS) {
    try {
      const exists = await FormSchema.findOne({ projectSlug: formData.projectSlug });
      if (exists) {
        console.log(`⏭  Skipping "${formData.projectName}" — already exists`);
        continue;
      }
      await FormSchema.create(formData);
      console.log(`✅  Created form: "${formData.projectName}" (${formData.fields.length} fields)`);
    } catch (err) {
      console.error(`❌  Error creating "${formData.projectName}":`, err.message);
    }
  }

  console.log('\n🎉 Seeding complete!');
  process.exit(0);
}

seedForms().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});