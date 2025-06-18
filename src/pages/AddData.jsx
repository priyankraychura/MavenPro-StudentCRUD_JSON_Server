import React, { useEffect, useState } from 'react'
import {
    Box,
    Typography,
    TextField,
    Button,
    Card,
    CardContent,
    Divider,
} from '@mui/material';
import { Link, useNavigate, useParams } from 'react-router-dom';
import showToast from '../servies/toastService';
import Skeleton from '@mui/material/Skeleton';


const AddData = () => {
    const [userData, setUserData] = useState([]);
    const { id } = useParams();
    const editIndex = id ? id : null;// change from useState to just a number
    const [formData, setFormData] = useState({
        id: String(Date.now()),
        name: '',
        class: '',
        grno: '',
        rollno: ''
    });
    document.title = editIndex ? "Update Student" : "Add Student";

    // sets all input field to true
    const [isValid, setIsValid] = useState({
        name: true,
        class: true,
        grno: true,
        rollno: true
    })
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('http://localhost:3000/students')
                const result = await response.json();
                setUserData(result);
            } catch (error) {
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [])

    useEffect(() => {
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 800); // simulate a short load time (e.g., 800ms)

        return () => clearTimeout(timeout);
    }, []);

    // checks whether id is received in params when loaded
    useEffect(() => {
        if (!loading && userData.length) {
            if (editIndex) {
                const student = userData?.find((item) => item?.id == editIndex); // compare as string
                if (student) {
                    setFormData(student);
                } else {
                    showToast('error', "Invalid student id!");
                    setTimeout(() => navigate('/'), 1500);
                }
            } else {
                // Auto-generate roll number if adding new
                const maxRollNo = userData?.reduce((max, curr) => {
                    const roll = parseInt(curr?.rollno);
                    return roll > max ? roll : max;
                }, 0);

                setFormData((prev) => ({
                    ...prev,
                    rollno: String(maxRollNo + 1),
                }));
            }
        }
    }, [loading, userData]);


    // checks if the length of input is greated than 3 when focus blurred
    const handleOnBlur = (e) => {

        if (e.target.value.length < 3) {
            setIsValid({ ...isValid, [e.target.name]: false })
        }
    }

    // set valid to true when input field is focused
    const handleFocus = (e) => {
        setIsValid({ ...isValid, [e.target.name]: true })
    }

    // handle submit for both add and update
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate all fields manually on submit
        const updatedValidity = {
            name: formData?.name?.trim().length >= 3,
            class: formData?.class?.trim().length >= 3,
            grno: formData?.grno?.trim().length >= 3,
            rollno: formData?.rollno?.trim().length > 0
        };

        setIsValid(updatedValidity);

        const isFormInvalid = Object.values(updatedValidity).some(value => value === false);

        if (isFormInvalid) {
            return;
        }

        let updatedData;

        // if id is received then update else add new data
        if (editIndex) {

            fetch(`http://localhost:3000/students/${editIndex}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            updatedData = userData?.map((item) =>
                item?.id == editIndex ? { ...formData, id: editIndex } : item
            );
            showToast('success', 'Updated successfully!');
        } else {
            updatedData = [...userData, { ...formData, id: String(Date.now()) }];

            fetch("http://localhost:3000/students", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            showToast('success', 'Added successfully!');
        }

        setUserData(updatedData);

        setTimeout(() => {
            navigate('/');
        }, 1500);
    };

    // sets form data when text typed
    const handleOnChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const fields = [
        {
            name: "rollno",
            label: "Roll Number",
            type: "number",
            disabled: true,
        },
        {
            name: "name",
            label: "Student Name",
            autoFocus: true,
        },
        {
            name: "class",
            label: "Class",
        },
        {
            name: "grno",
            label: "GR Number",
            type: "number",
        },
    ];


    return (

        <Box
            sx={{
                minHeight: '91vh',
                backgroundColor: '#101624',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 2,
            }}
        >

            <Card
                sx={{
                    width: '100%',
                    maxWidth: 520,
                    borderRadius: 4,
                    backgroundColor: '#1e293b',
                    boxShadow: '0px 4px 24px rgba(0,0,0,0.4)',
                }}
            >
                <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" sx={{ color: '#fff', mb: 1 }}>
                        {
                            loading ? <Skeleton height={40} /> :
                                editIndex ? 'Update Student' : 'Add New Student'
                        }
                    </Typography>
                    <Divider sx={{ background: '#334155', mb: 3 }} />

                    <Box component="form" autoComplete="off" onSubmit={handleSubmit}>
                        {fields?.map((field) => (
                            loading ? <Skeleton variant="rounded" height={60} sx={{ mb: 3 }} />
                                : <TextField
                                    key={field?.name}
                                    name={field?.name}
                                    label={field?.label}
                                    type={field?.type || "text"}
                                    disabled={field?.disabled || false}
                                    autoFocus={field?.autoFocus || false}
                                    error={!isValid?.[field?.name]}
                                    value={formData?.[field?.name]}
                                    onChange={handleOnChange}
                                    onBlur={handleOnBlur}
                                    onFocus={handleFocus}
                                    fullWidth
                                    margin="normal"
                                    variant="outlined"
                                    helperText={!isValid?.[field?.name] ? "Invalid input" : ""}
                                    InputProps={{ style: { color: "#fff" } }}
                                    InputLabelProps={{
                                        style: {
                                            color: !isValid?.[field?.name] ? "#E23F44" : "#cbd5e1",
                                        },
                                    }}
                                    sx={{
                                        "& fieldset": { borderColor: "#334155" },
                                        "&:hover fieldset": { borderColor: "#64748b" },
                                    }}
                                />
                        ))}


                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
                            <Link to="/">
                                {
                                    loading ? <Skeleton variant="rounded" width={80} height={40} />
                                        : <Button variant="outlined" sx={{
                                            borderColor: '#64748b',
                                            color: '#cbd5e1',
                                            '&:hover': {
                                                borderColor: '#94a3b8',
                                                backgroundColor: '#1e293b',
                                            },
                                        }}>
                                            Cancel
                                        </Button>
                                }
                            </Link>
                            {
                                loading ? <Skeleton variant="rounded" width={80} height={40} />
                                    : <Button
                                        type="submit"
                                        variant="contained"
                                        sx={{
                                            backgroundColor: '#38bdf8',
                                            color: '#000',
                                            '&:hover': {
                                                backgroundColor: '#0ea5e9',
                                            },
                                        }}
                                    >
                                        Submit
                                    </Button>
                            }
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
}

export default AddData