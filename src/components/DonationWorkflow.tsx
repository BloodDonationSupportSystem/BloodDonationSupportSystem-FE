import React, { useState, useEffect } from 'react';
import {
    Card,
    Steps,
    Button,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Divider,
    Space,
    Alert,
    Modal,
    Radio,
    Typography,
    Spin,
    Descriptions,
    Tag,
    Row,
    Col,
    Select,
    message
} from 'antd';
import {
    UserOutlined,
    HeartOutlined,
    MedicineBoxOutlined,
    CheckCircleOutlined,
    WarningOutlined,
    LoadingOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useDonationEvents } from '@/hooks/api/useDonationEvents';
import {
    DonationEvent,
    CheckInRequest,
    HealthCheckRequest,
    StartDonationRequest,
    CompleteDonationRequest,
    ComplicationRequest
} from '@/services/api/donationEventService';
import { useBloodGroups } from '@/hooks/api/useBloodGroups';
import apiClient from '@/services/api/apiConfig';
import { useRouter } from 'next/router';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface DonationWorkflowProps {
    appointmentId: string;
    onFinish?: (event: DonationEvent) => void;
    onCancel?: () => void;
}

// Donation workflow steps
enum DonationStep {
    CheckIn = 0,
    HealthCheck = 1,
    StartDonation = 2,
    CompleteDonation = 3
}

// Complication types
const complicationTypes = [
    'Vasovagal Reaction',
    'Hematoma',
    'Citrate Reaction',
    'Allergic Reaction',
    'Nerve Injury',
    'Other'
];

// Rejection reasons commonly encountered
const commonRejectionReasons = [
    'Low Hemoglobin',
    'High Blood Pressure',
    'Low Blood Pressure',
    'Recent Illness',
    'Recent Medication',
    'Recent Tattoo/Piercing',
    'Recent Travel to Endemic Area',
    'Weight Below Minimum',
    'Temperature Out of Range',
    'Under Age Restriction',
    'Recent Blood Donation',
    'Other'
];

const DonationWorkflow: React.FC<DonationWorkflowProps> = ({
    appointmentId,
    onFinish,
    onCancel
}) => {
    // State
    const [currentStep, setCurrentStep] = useState<DonationStep>(DonationStep.HealthCheck);
    const [donationEventId, setDonationEventId] = useState<string>('');
    const [hasComplication, setHasComplication] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [checkInForm] = Form.useForm();
    const [healthCheckForm] = Form.useForm();
    const [startDonationForm] = Form.useForm();
    const [completeDonationForm] = Form.useForm();
    const [complicationForm] = Form.useForm();
    const [workflowCompleted, setWorkflowCompleted] = useState<boolean>(false);
    const [completedEvent, setCompletedEvent] = useState<DonationEvent | null>(null);

    // Hooks
    const {
        currentEvent,
        isProcessing,
        checkInDonor,
        performHealthCheck,
        startDonation,
        completeDonation,
        recordComplication,
        getDonationEventById,
        findDonationEventByAppointmentId
    } = useDonationEvents();
    const { bloodGroups } = useBloodGroups();
    const router = useRouter();

    // Load the donation event when component mounts
    useEffect(() => {
        async function loadDonationEvent() {
            try {
                console.log('Loading donation event for appointment ID:', appointmentId);

                // First check if an appointment ID is provided
                if (!appointmentId) {
                    console.error('No appointment ID provided, cannot load donation event');
                    message.error('Missing appointment ID. Cannot proceed with donation workflow.');
                    setLoading(false);
                    return;
                }

                // Find donation event by appointment ID using the correct API endpoint
                const event = await findDonationEventByAppointmentId(appointmentId);
                console.log('Donation event API response:', event);

                if (event && event.id) {
                    console.log('Found donation event by appointment ID:', event);
                    console.log('Setting donationEventId to:', event.id);
                    setDonationEventId(event.id);

                    // Update forms with the event ID
                    healthCheckForm.setFieldsValue({ donationEventId: event.id });
                    startDonationForm.setFieldsValue({ donationEventId: event.id });
                    completeDonationForm.setFieldsValue({ donationEventId: event.id });
                    complicationForm.setFieldsValue({ donationEventId: event.id });

                    // Check if health check has already been completed based on status
                    // The status will indicate if health check is done
                    if (event.status && event.status !== 'Pending') {
                        console.log('Health check already completed, status:', event.status);

                        // Pre-fill health check form with existing data if available
                        const healthData: any = {
                            donationEventId: event.id,
                            isEligible: event.status !== 'Rejected'
                        };

                        // If blood group is available, set it
                        if (event.bloodGroupId) {
                            healthData.verifiedBloodGroupId = event.bloodGroupId;
                        }

                        healthCheckForm.setFieldsValue(healthData);

                        // Skip to next step if health check is already done
                        if (currentStep === DonationStep.HealthCheck) {
                            setCurrentStep(DonationStep.StartDonation);
                        }
                    }

                    // Check if donation has already been started based on status
                    if (event.status && ['InProgress', 'Completed', 'Processed'].includes(event.status)) {
                        console.log('Donation already started, status:', event.status);

                        // Pre-fill start donation form with existing data
                        startDonationForm.setFieldsValue({
                            donationEventId: event.id,
                            notes: ''  // Default empty notes since it's not in the DonationEvent interface
                        });

                        // Skip to next step if donation is already started
                        if (currentStep === DonationStep.StartDonation) {
                            setCurrentStep(DonationStep.CompleteDonation);
                        }
                    }

                    // Check if donation has already been completed based on status
                    if (event.status && ['Completed', 'Processed'].includes(event.status)) {
                        console.log('Donation already completed, status:', event.status);

                        // Pre-fill complete donation form with existing data
                        completeDonationForm.setFieldsValue({
                            donationEventId: event.id,
                            donationDate: event.collectedAt ? dayjs(event.collectedAt) : dayjs(),
                            quantityDonated: event.quantityUnits * 450 || 450.0,
                            quantityUnits: event.quantityUnits || 1,
                            notes: ''  // Default empty notes since it's not in the DonationEvent interface
                        });

                        // Show completion message
                        message.info('This donation has already been completed');
                    }
                } else {
                    console.error('No valid donation event found for appointment ID:', appointmentId);
                    message.error('No donation event found for this appointment. Please check in the donor first.');

                    // Redirect to appointments page
                    onCancel && onCancel();
                    return;
                }
            } catch (error) {
                console.error("Error loading donation event:", error);
                message.error('Failed to load donation event. Please try again.');

                // Redirect to appointments page on error
                onCancel && onCancel();
                return;
            } finally {
                setLoading(false);
            }
        }

        loadDonationEvent();
    }, [appointmentId]);

    // Initialize forms with default values
    useEffect(() => {
        // Check-in form is no longer used
        healthCheckForm.setFieldsValue({
            donationEventId,
            bloodPressure: '120/80',
            temperature: 36.5,
            hemoglobinLevel: 13.5,
            weight: 65.0,
            height: 170.0,
            isEligible: true
        });

        startDonationForm.setFieldsValue({
            donationEventId,
            notes: ''
        });

        completeDonationForm.setFieldsValue({
            donationEventId,
            donationDate: dayjs(),
            quantityDonated: 450.0,
            quantityUnits: 1,
            notes: ''
        });

        complicationForm.setFieldsValue({
            donationEventId,
            complicationType: 'Vasovagal Reaction',
            isUsable: false
        });
    }, [donationEventId]);

    // Update donation event ID when current event changes
    useEffect(() => {
        if (currentEvent && currentEvent.id) {
            setDonationEventId(currentEvent.id);

            // Update forms with the new event ID
            healthCheckForm.setFieldsValue({ donationEventId: currentEvent.id });
            startDonationForm.setFieldsValue({ donationEventId: currentEvent.id });
            completeDonationForm.setFieldsValue({ donationEventId: currentEvent.id });
            complicationForm.setFieldsValue({ donationEventId: currentEvent.id });
        }
    }, [currentEvent]);

    // Handle check-in submission - no longer needed but kept for reference
    const handleCheckIn = async (values: any) => {
        // This function is no longer used since check-in is already done
        console.log('Check-in already completed');
    };

    // Handle health check submission
    const handleHealthCheck = async (values: any) => {
        setLoading(true);

        // Determine the final rejection reason
        let finalRejectionReason = values.rejectionReason;
        if (values.rejectionReason === 'Other' && values.rejectionReasonOther) {
            finalRejectionReason = values.rejectionReasonOther;
        }

        // Ensure we have a valid donationEventId
        const eventId = values.donationEventId || donationEventId;

        // Log the donation event ID for debugging
        console.log('Health Check - Form values:', values);
        console.log('Health Check - Donation Event ID from form:', values.donationEventId);
        console.log('Health Check - Donation Event ID from state:', donationEventId);
        console.log('Health Check - Final Donation Event ID used:', eventId);

        if (!eventId) {
            console.error('No donation event ID available for health check');
            message.error('Missing donation event ID. Cannot proceed with health check.');
            setLoading(false);
            return;
        }

        // Validate that verifiedBloodGroupId is provided
        if (!values.verifiedBloodGroupId) {
            console.error('Missing verified blood group ID');
            message.error('Please select a verified blood group before proceeding.');
            setLoading(false);
            return;
        }

        const request: HealthCheckRequest = {
            donationEventId: eventId,
            bloodPressure: values.bloodPressure,
            temperature: values.temperature,
            hemoglobinLevel: values.hemoglobinLevel,
            weight: values.weight,
            height: values.height,
            isEligible: values.isEligible,
            medicalNotes: values.medicalNotes,
            verifiedBloodGroupId: values.verifiedBloodGroupId,
            rejectionReason: values.isEligible ? undefined : finalRejectionReason
        };

        // Log the complete request for debugging
        console.log('Health Check Request:', JSON.stringify(request, null, 2));

        try {
            const event = await performHealthCheck(request);
            console.log('Health Check Response:', event);

            if (event) {
                if (values.isEligible) {
                    // If eligible, move to next step
                    setCurrentStep(DonationStep.StartDonation);
                } else {
                    // If not eligible, finish the workflow
                    handleWorkflowFinish(event);
                }
            }
        } catch (error) {
            console.error('Health Check Error:', error);
            message.error('Failed to submit health check. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Handle donation start submission
    const handleStartDonation = async (values: any) => {
        setLoading(true);

        const request: StartDonationRequest = {
            donationEventId: values.donationEventId,
            notes: values.notes
        };

        const event = await startDonation(request);

        if (event) {
            setCurrentStep(DonationStep.CompleteDonation);
        }

        setLoading(false);
    };

    // Handle donation completion submission
    const handleCompleteDonation = async (values: any) => {
        setLoading(true);

        const request: CompleteDonationRequest = {
            donationEventId: values.donationEventId,
            donationDate: values.donationDate.toISOString(),
            quantityDonated: values.quantityDonated,
            quantityUnits: values.quantityUnits,
            notes: values.notes
        };

        const event = await completeDonation(request);

        if (event && onFinish) {
            handleWorkflowFinish(event);
        }

        setLoading(false);
    };

    // Handle complication submission
    const handleComplication = async (values: any) => {
        setLoading(true);

        const request: ComplicationRequest = {
            donationEventId: values.donationEventId,
            complicationType: values.complicationType,
            description: values.description,
            collectedAmount: values.collectedAmount,
            isUsable: values.isUsable,
            actionTaken: values.actionTaken
        };

        const event = await recordComplication(request);

        if (event && onFinish) {
            handleWorkflowFinish(event);
        }

        setLoading(false);
    };

    // Show complication modal
    const showComplicationModal = () => {
        setHasComplication(true);
    };

    // Handle workflow completion
    const handleWorkflowFinish = (event: DonationEvent) => {
        setWorkflowCompleted(true);
        setCompletedEvent(event);
        message.success('Donation workflow completed successfully');
    };

    // Render step content based on current step
    const renderStepContent = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center p-8">
                    <Spin size="large" tip="Loading donation data..." />
                </div>
            );
        }

        switch (currentStep) {
            case DonationStep.CheckIn:
                // Skip this step and go directly to health check
                setCurrentStep(DonationStep.HealthCheck);
                return null;

            case DonationStep.HealthCheck:
                // Check if health check is already completed based on current event status
                const isHealthCheckCompleted = currentEvent && currentEvent.status && currentEvent.status !== 'Pending';

                return (
                    <Form
                        form={healthCheckForm}
                        layout="vertical"
                        onFinish={handleHealthCheck}
                    >
                        {isHealthCheckCompleted && (
                            <Alert
                                message="Health check already completed"
                                description="This donor's health check has already been completed. You can review the information below."
                                type="info"
                                showIcon
                                className="mb-4"
                            />
                        )}

                        <Form.Item
                            name="donationEventId"
                            hidden
                        >
                            <Input />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    name="bloodPressure"
                                    label="Blood Pressure (mmHg)"
                                    rules={[{ required: true, message: 'Please enter blood pressure' }]}
                                >
                                    <Input placeholder="e.g., 120/80" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item
                                    name="temperature"
                                    label="Temperature (°C)"
                                    rules={[{ required: true, message: 'Please enter temperature' }]}
                                >
                                    <InputNumber step={0.1} min={35} max={40} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col span={8}>
                                <Form.Item
                                    name="hemoglobinLevel"
                                    label="Hemoglobin Level (g/dL)"
                                    rules={[{ required: true, message: 'Please enter hemoglobin level' }]}
                                >
                                    <InputNumber step={0.1} min={5} max={20} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="weight"
                                    label="Weight (kg)"
                                    rules={[{ required: true, message: 'Please enter weight' }]}
                                >
                                    <InputNumber step={0.1} min={40} max={150} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="height"
                                    label="Height (cm)"
                                    rules={[{ required: true, message: 'Please enter height' }]}
                                >
                                    <InputNumber step={0.1} min={140} max={220} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="verifiedBloodGroupId"
                            label="Verified Blood Group"
                        >
                            <Select placeholder="Select verified blood group">
                                {bloodGroups.map(group => (
                                    <Option key={group.id} value={group.id}>
                                        {group.groupName}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="isEligible"
                            label="Is Eligible to Donate?"
                            rules={[{ required: true, message: 'Please select eligibility status' }]}
                        >
                            <Radio.Group onChange={(e) => {
                                const isEligible = e.target.value;
                                // Force update the form to show/hide the rejection reason fields
                                healthCheckForm.setFieldsValue({
                                    isEligible,
                                    // Clear rejection reason when switching back to eligible
                                    ...(isEligible ? { rejectionReason: undefined, rejectionReasonOther: undefined } : {})
                                });
                            }}>
                                <Radio value={true}>Yes</Radio>
                                <Radio value={false}>No</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            name="medicalNotes"
                            label="Medical Notes"
                        >
                            <TextArea rows={3} placeholder="Any medical notes or observations" />
                        </Form.Item>

                        {/* Use Form.Item.noStyle to force re-render when isEligible changes */}
                        <Form.Item noStyle dependencies={['isEligible']}>
                            {({ getFieldValue }) => {
                                const isEligible = getFieldValue('isEligible');
                                return !isEligible ? (
                                    <>
                                        <Form.Item
                                            name="rejectionReason"
                                            label="Rejection Reason"
                                            rules={[
                                                {
                                                    required: true,
                                                    message: 'Please provide rejection reason'
                                                }
                                            ]}
                                        >
                                            <Select
                                                placeholder="Select a rejection reason"
                                                allowClear
                                                showSearch
                                                onChange={(value) => {
                                                    if (value === 'Other') {
                                                        // If 'Other' is selected, enable the custom reason textbox
                                                        healthCheckForm.setFieldsValue({ rejectionReasonOther: '' });
                                                    } else {
                                                        // If a predefined reason is selected, clear the custom reason
                                                        healthCheckForm.setFieldsValue({ rejectionReasonOther: undefined });
                                                    }
                                                }}
                                            >
                                                {commonRejectionReasons.map(reason => (
                                                    <Option key={reason} value={reason}>{reason}</Option>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                        <Form.Item noStyle dependencies={['rejectionReason']}>
                                            {({ getFieldValue }) => {
                                                const rejectionReason = getFieldValue('rejectionReason');
                                                return rejectionReason === 'Other' ? (
                                                    <Form.Item
                                                        name="rejectionReasonOther"
                                                        label="Specify Other Reason"
                                                        rules={[
                                                            {
                                                                required: true,
                                                                message: 'Please specify the rejection reason'
                                                            }
                                                        ]}
                                                    >
                                                        <TextArea
                                                            rows={2}
                                                            placeholder="Please specify the reason for rejection"
                                                        />
                                                    </Form.Item>
                                                ) : null;
                                            }}
                                        </Form.Item>
                                    </>
                                ) : null;
                            }}
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button onClick={onCancel}>Cancel</Button>
                                <Form.Item noStyle shouldUpdate={(prevValues, currentValues) =>
                                    prevValues.isEligible !== currentValues.isEligible
                                }>
                                    {({ getFieldValue }) => {
                                        const isEligible = getFieldValue('isEligible');
                                        return (
                                            <Button
                                                type="primary"
                                                htmlType="submit"
                                                loading={isProcessing || loading}
                                                danger={isEligible === false}
                                            >
                                                {isEligible === true ? 'Continue' : 'Reject Donor'}
                                            </Button>
                                        );
                                    }}
                                </Form.Item>
                            </Space>
                        </Form.Item>
                    </Form>
                );

            case DonationStep.StartDonation:
                return (
                    <Form
                        form={startDonationForm}
                        layout="vertical"
                        onFinish={handleStartDonation}
                    >
                        <Form.Item
                            name="donationEventId"
                            hidden
                        >
                            <Input />
                        </Form.Item>

                        <Alert
                            message="Ready to Start Donation"
                            description="All health checks have been passed. Donor is ready for the donation procedure."
                            type="success"
                            showIcon
                            className="mb-6"
                        />

                        <Form.Item
                            name="notes"
                            label="Notes"
                        >
                            <TextArea rows={3} placeholder="Optional notes before starting donation" />
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button onClick={() => setCurrentStep(DonationStep.HealthCheck)}>Back</Button>
                                <Button type="primary" htmlType="submit" loading={isProcessing || loading}>
                                    Start Donation
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                );

            case DonationStep.CompleteDonation:
                return hasComplication ? (
                    <Form
                        form={complicationForm}
                        layout="vertical"
                        onFinish={handleComplication}
                    >
                        <Form.Item
                            name="donationEventId"
                            hidden
                        >
                            <Input />
                        </Form.Item>

                        <Alert
                            message="Record Complication"
                            description="Please record details about the complication that occurred during the donation process."
                            type="warning"
                            showIcon
                            className="mb-6"
                        />

                        <Form.Item
                            name="complicationType"
                            label="Complication Type"
                            rules={[{ required: true, message: 'Please select complication type' }]}
                        >
                            <Select placeholder="Select complication type">
                                {complicationTypes.map(type => (
                                    <Option key={type} value={type}>
                                        {type}
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, message: 'Please provide a description' }]}
                        >
                            <TextArea rows={3} placeholder="Describe the complication in detail" />
                        </Form.Item>

                        <Form.Item
                            name="collectedAmount"
                            label="Collected Amount (mL)"
                        >
                            <InputNumber min={0} max={500} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="isUsable"
                            label="Is the collected blood usable?"
                            rules={[{ required: true, message: 'Please specify if blood is usable' }]}
                        >
                            <Radio.Group>
                                <Radio value={true}>Yes</Radio>
                                <Radio value={false}>No</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            name="actionTaken"
                            label="Action Taken"
                            rules={[{ required: true, message: 'Please describe the action taken' }]}
                        >
                            <TextArea rows={3} placeholder="Describe the actions taken to address the complication" />
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button onClick={() => setHasComplication(false)}>Cancel</Button>
                                <Button type="primary" danger htmlType="submit" loading={isProcessing || loading}>
                                    Record Complication
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                ) : (
                    <Form
                        form={completeDonationForm}
                        layout="vertical"
                        onFinish={handleCompleteDonation}
                    >
                        <Form.Item
                            name="donationEventId"
                            hidden
                        >
                            <Input />
                        </Form.Item>

                        <Alert
                            message="Donation in Progress"
                            description="The donation process is currently in progress. Complete the form when finished."
                            type="info"
                            showIcon
                            className="mb-6"
                        />

                        <Form.Item
                            name="donationDate"
                            label="Donation Completion Time"
                            rules={[{ required: true, message: 'Please select completion time' }]}
                        >
                            <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                        </Form.Item>

                        <Row gutter={16}>
                            <Col span={16}>
                                <Form.Item
                                    name="quantityDonated"
                                    label="Quantity Donated (mL)"
                                    rules={[{ required: true, message: 'Please enter quantity donated' }]}
                                >
                                    <InputNumber min={1} max={500} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                            <Col span={8}>
                                <Form.Item
                                    name="quantityUnits"
                                    label="Number of Units"
                                    rules={[{ required: true, message: 'Please enter number of units' }]}
                                >
                                    <InputNumber min={1} max={5} style={{ width: '100%' }} />
                                </Form.Item>
                            </Col>
                        </Row>

                        <Form.Item
                            name="notes"
                            label="Notes"
                        >
                            <TextArea rows={3} placeholder="Optional notes about the donation" />
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button onClick={() => setCurrentStep(DonationStep.StartDonation)}>Back</Button>
                                <Button type="primary" danger onClick={showComplicationModal}>
                                    Record Complication
                                </Button>
                                <Button type="primary" htmlType="submit" loading={isProcessing || loading}>
                                    Complete Donation
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                );

            default:
                return null;
        }
    };

    // Add function to handle step change
    const handleStepChange = (step: number) => {
        // Only allow navigation to steps that are accessible
        if (step < currentStep) {
            setCurrentStep(step);
        }
    };

    // Add useEffect to handle prefill when navigating back to Health Check
    useEffect(() => {
        // When current step changes to Health Check, ensure form is properly filled
        if ((currentStep === DonationStep.HealthCheck) && currentEvent) {
            console.log('Prefilling health check form with current event data:', currentEvent);

            // Prefill form với dữ liệu từ currentEvent
            const prefillData = {
                donationEventId: currentEvent.id,
                bloodPressure: '120/80', // Default values
                temperature: 36.5,
                hemoglobinLevel: 13.5,
                weight: 65.0,
                height: 170.0,
                isEligible: currentEvent.status !== 'Rejected',
                verifiedBloodGroupId: currentEvent.bloodGroupId || '',
                medicalNotes: ''
            };

            // Điền form với dữ liệu
            healthCheckForm.setFieldsValue(prefillData);

            // Đặt radio button isEligible
            if (currentEvent.status === 'Rejected') {
                healthCheckForm.setFieldsValue({
                    isEligible: false,
                    // Đặt lý do từ chối mặc định nếu trạng thái là Rejected
                    rejectionReason: 'Other'
                });
            } else {
                healthCheckForm.setFieldsValue({ isEligible: true });
            }

            // Force form to update UI
            setTimeout(() => {
                healthCheckForm.validateFields().catch(e => console.log('Validation error:', e));
            }, 100);
        }
    }, [currentStep, currentEvent]);

    // Render completion summary
    const renderCompletionSummary = () => {
        if (!completedEvent) return null;

        // Format dates with Vietnam timezone (+7)
        const formatDate = (dateString: string | undefined) => {
            if (!dateString) return 'N/A';
            return dayjs(dateString).add(7, 'hour').format('DD/MM/YYYY HH:mm:ss');
        };

        // Format duration between two dates
        const formatDuration = (startDate: string | undefined, endDate: string | undefined) => {
            if (!startDate || !endDate) return 'N/A';
            const start = dayjs(startDate);
            const end = dayjs(endDate);
            const diffMinutes = end.diff(start, 'minute');

            if (diffMinutes < 60) {
                return `${diffMinutes} phút`;
            } else {
                const hours = Math.floor(diffMinutes / 60);
                const minutes = diffMinutes % 60;
                return `${hours} giờ ${minutes} phút`;
            }
        };

        return (
            <div className="mt-4">
                <Alert
                    message="Hiến máu đã hoàn thành thành công"
                    description="Quá trình hiến máu đã được hoàn thành và ghi nhận. Máu đã hiến đã được thêm vào kho."
                    type="success"
                    showIcon
                    className="mb-6"
                />

                <Card title="Thông tin người hiến máu" className="mb-4">
                    <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                        <Descriptions.Item label="Họ tên" span={2}>
                            <strong>{completedEvent.donorName || 'Không có thông tin'}</strong>
                        </Descriptions.Item>

                        <Descriptions.Item label="ID người hiến máu">
                            {completedEvent.donorId || 'Không có thông tin'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Nhóm máu">
                            <Tag color="red">{completedEvent.bloodGroupName || 'Không xác định'}</Tag>
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card title="Chi tiết đợt hiến máu" className="mb-4">
                    <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                        <Descriptions.Item label="Mã hiến máu">
                            {completedEvent.id || 'Không có thông tin'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng thái">
                            <Tag color="green">{completedEvent.status || 'Đã hoàn thành'}</Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Loại thành phần máu">
                            <Tag color="blue">{completedEvent.componentTypeName || 'Máu toàn phần'}</Tag>
                        </Descriptions.Item>

                        <Descriptions.Item label="Số lượng hiến">
                            {completedEvent.quantityDonated ?
                                `${completedEvent.quantityDonated} mL` :
                                `${completedEvent.quantityUnits || 1} đơn vị`}
                        </Descriptions.Item>

                        <Descriptions.Item label="Địa điểm" span={2}>
                            {completedEvent.locationName || completedEvent.donationLocation || 'Không xác định'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ngày hẹn" span={2}>
                            {formatDate(completedEvent.appointmentDate)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Thời gian check-in">
                            {formatDate(completedEvent.checkInTime)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Thời gian bắt đầu hiến">
                            {formatDate(completedEvent.donationStartTime)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Thời gian hoàn thành">
                            {formatDate(completedEvent.completedTime)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Thời gian hiến">
                            {formatDate(completedEvent.donationDate)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Tổng thời gian" span={2}>
                            {formatDuration(completedEvent.checkInTime, completedEvent.completedTime)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Ghi chú" span={2}>
                            {completedEvent.notes || 'Không có ghi chú'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                <Card title="Thông tin kiểm tra sức khỏe" className="mb-4">
                    <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                        <Descriptions.Item label="Huyết áp">
                            {completedEvent.bloodPressure || 'Không ghi nhận'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Nhiệt độ">
                            {completedEvent.temperature ? `${completedEvent.temperature} °C` : 'Không ghi nhận'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Mức hemoglobin">
                            {completedEvent.hemoglobinLevel ? `${completedEvent.hemoglobinLevel} g/dL` : 'Không ghi nhận'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Cân nặng">
                            {completedEvent.weight ? `${completedEvent.weight} kg` : 'Không ghi nhận'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Chiều cao">
                            {completedEvent.height ? `${completedEvent.height} cm` : 'Không ghi nhận'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Có thể sử dụng">
                            {completedEvent.isUsable !== undefined ? (
                                completedEvent.isUsable ?
                                    <Tag color="green">Có</Tag> :
                                    <Tag color="red">Không</Tag>
                            ) : 'Không xác định'}
                        </Descriptions.Item>

                        {completedEvent.medicalNotes && (
                            <Descriptions.Item label="Ghi chú y tế" span={2}>
                                {completedEvent.medicalNotes}
                            </Descriptions.Item>
                        )}
                    </Descriptions>
                </Card>

                <Card title="Thông tin hệ thống" className="mb-4">
                    <Descriptions bordered column={{ xs: 1, sm: 2 }}>
                        <Descriptions.Item label="Mã yêu cầu">
                            {completedEvent.requestId || 'Không có thông tin'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Loại yêu cầu">
                            {completedEvent.requestType || 'Không có thông tin'}
                        </Descriptions.Item>

                        <Descriptions.Item label="Thời gian tạo">
                            {formatDate(completedEvent.createdTime)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Thời gian cập nhật cuối">
                            {formatDate(completedEvent.lastUpdatedTime)}
                        </Descriptions.Item>

                        <Descriptions.Item label="Trạng thái hoạt động">
                            {completedEvent.isActive !== undefined ? (
                                completedEvent.isActive ?
                                    <Tag color="green">Đang hoạt động</Tag> :
                                    <Tag color="red">Không hoạt động</Tag>
                            ) : 'Không xác định'}
                        </Descriptions.Item>
                    </Descriptions>
                </Card>

                {(completedEvent.complicationType || completedEvent.complicationDetails) && (
                    <Card title="Biến chứng" className="mb-4">
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Loại biến chứng">
                                {completedEvent.complicationType || 'Không xác định'}
                            </Descriptions.Item>

                            <Descriptions.Item label="Chi tiết biến chứng">
                                {completedEvent.complicationDetails || 'Không có chi tiết'}
                            </Descriptions.Item>

                            <Descriptions.Item label="Hành động đã thực hiện">
                                {completedEvent.actionTaken || 'Không có hành động được ghi nhận'}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                )}

                <div className="flex justify-end space-x-4">
                    <Button onClick={() => router.push('/staff/appointments')}>
                        Quay lại danh sách cuộc hẹn
                    </Button>
                    <Button type="primary" onClick={() => router.push('/staff/dashboard')}>
                        Đi đến Bảng điều khiển
                    </Button>
                </div>
            </div>
        );
    };

    // Update the main return statement
    if (workflowCompleted) {
        return (
            <div className="donation-workflow-page">
                <div className="flex items-center mb-4">
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        onClick={() => router.push('/staff/appointments')}
                    >
                        Back to Appointments
                    </Button>
                </div>
                {renderCompletionSummary()}
            </div>
        );
    }

    // Render steps indicator
    return (
        <Card className="mt-4">
            <Steps
                current={currentStep}
                onChange={handleStepChange}
            >
                <Steps.Step
                    title="Check-in"
                    icon={<UserOutlined />}
                    status="finish"
                    description="Already completed"
                    disabled={true}
                />
                <Steps.Step
                    title="Health Check"
                    icon={<MedicineBoxOutlined />}
                    description={currentEvent && currentEvent.status && currentEvent.status !== 'Pending' ? 'Already completed' : ''}
                />
                <Steps.Step
                    title="Start Donation"
                    icon={<HeartOutlined />}
                    description={currentEvent && currentEvent.status && ['InProgress', 'Completed', 'Processed'].includes(currentEvent.status) ? 'Already completed' : ''}
                />
                <Steps.Step
                    title="Complete Donation"
                    icon={<CheckCircleOutlined />}
                    description={currentEvent && currentEvent.status && ['Completed', 'Processed'].includes(currentEvent.status) ? 'Already completed' : ''}
                />
            </Steps>

            <Divider />

            <div className="py-4">
                {renderStepContent()}
            </div>

            {hasComplication && (
                <Modal
                    title={
                        <div className="flex items-center">
                            <WarningOutlined className="text-yellow-500 mr-2" />
                            <span>Record Complication</span>
                        </div>
                    }
                    open={hasComplication}
                    onCancel={() => setHasComplication(false)}
                    footer={null}
                    width={700}
                >
                    <Form
                        form={complicationForm}
                        layout="vertical"
                        onFinish={handleComplication}
                    >
                        <Form.Item
                            name="donationEventId"
                            hidden
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item
                            name="complicationType"
                            label="Complication Type"
                            rules={[{ required: true, message: 'Please select complication type' }]}
                        >
                            <Select>
                                {complicationTypes.map(type => (
                                    <Option key={type} value={type}>{type}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Description"
                            rules={[{ required: true, message: 'Please enter description' }]}
                        >
                            <TextArea rows={4} placeholder="Describe the complication in detail" />
                        </Form.Item>

                        <Form.Item
                            name="collectedAmount"
                            label="Amount Collected (mL)"
                            rules={[{ required: true, message: 'Please enter amount collected' }]}
                        >
                            <InputNumber min={0} max={500} style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="isUsable"
                            label="Is Blood Usable?"
                            rules={[{ required: true, message: 'Please select if blood is usable' }]}
                        >
                            <Radio.Group>
                                <Radio value={true}>Yes</Radio>
                                <Radio value={false}>No</Radio>
                            </Radio.Group>
                        </Form.Item>

                        <Form.Item
                            name="actionTaken"
                            label="Action Taken"
                            rules={[{ required: true, message: 'Please describe action taken' }]}
                        >
                            <TextArea rows={3} placeholder="Describe actions taken to address the complication" />
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button onClick={() => setHasComplication(false)}>Cancel</Button>
                                <Button type="primary" htmlType="submit" danger loading={isProcessing || loading}>
                                    Record Complication
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            )}
        </Card>
    );
};

export default DonationWorkflow; 