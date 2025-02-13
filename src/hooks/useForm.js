import { useState, useCallback } from 'react';

const useForm = (initialState = {}, validate = null) => {
    const [values, setValues] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        
        // Handle nested values (e.g., 'tuition.amount')
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setValues(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setValues(prev => ({
                ...prev,
                [name]: value
            }));
        }

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched(prev => ({
            ...prev,
            [name]: true
        }));

        // Validate single field on blur if validate function exists
        if (validate) {
            const validationErrors = validate({
                ...values,
                [name]: values[name]
            });
            setErrors(prev => ({
                ...prev,
                [name]: validationErrors[name] || ''
            }));
        }
    }, [values, validate]);

    const handleSubmit = useCallback((onSubmit) => async (e) => {
        e.preventDefault();

        // Mark all fields as touched
        const allTouched = Object.keys(values).reduce((acc, key) => ({
            ...acc,
            [key]: true
        }), {});
        setTouched(allTouched);

        // Validate all fields if validate function exists
        if (validate) {
            const validationErrors = validate(values);
            setErrors(validationErrors);

            // If there are errors, don't submit
            if (Object.keys(validationErrors).length > 0) {
                return;
            }
        }

        // Call onSubmit callback
        await onSubmit(values);
    }, [values, validate]);

    const reset = useCallback(() => {
        setValues(initialState);
        setErrors({});
        setTouched({});
    }, [initialState]);

    const setFieldValue = useCallback((name, value) => {
        // Handle nested values
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setValues(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setValues(prev => ({
                ...prev,
                [name]: value
            }));
        }
    }, []);

    const setFieldError = useCallback((name, error) => {
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    }, []);

    return {
        values,
        errors,
        touched,
        handleChange,
        handleBlur,
        handleSubmit,
        reset,
        setFieldValue,
        setFieldError,
        isValid: Object.keys(errors).length === 0
    };
};

export default useForm; 