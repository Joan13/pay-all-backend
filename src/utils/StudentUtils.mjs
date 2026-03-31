/**
 * Utility functions for student-related operations
 */

/**
 * Sort students alphabetically by name + family_name + surname
 * @param {Array} students - Array of student objects
 * @param {string} studentPath - Path to the student object within each array item (default: 'student')
 * @returns {Array} Sorted array of students
 */
export const sortStudentsAlphabetically = (students, studentPath = 'student') => {
    if (!Array.isArray(students) || students.length === 0) {
        return students;
    }

    return students.sort((a, b) => {
        // Navigate to the student object based on the path
        const studentA = getNestedProperty(a, studentPath);
        const studentB = getNestedProperty(b, studentPath);

        if (!studentA || !studentB) {
            return 0;
        }

        const nameA = `${studentA.name || ''} ${studentA.family_name || ''} ${studentA.surname || ''}`.trim().toLowerCase();
        const nameB = `${studentB.name || ''} ${studentB.family_name || ''} ${studentB.surname || ''}`.trim().toLowerCase();
        
        return nameA.localeCompare(nameB);
    });
};

/**
 * Helper function to get nested property from an object
 * @param {Object} obj - The object to search in
 * @param {string} path - The path to the property (e.g., 'student' or 'student.student')
 * @returns {*} The value at the path or null if not found
 */
const getNestedProperty = (obj, path) => {
    if (!obj || !path) return null;
    
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
        if (result === null || result === undefined || typeof result !== 'object') {
            return null;
        }
        result = result[key];
    }
    
    return result;
};

/**
 * Sort assignments by student name
 * @param {Array} assignments - Array of assignment objects with student_details
 * @returns {Array} Sorted array of assignments
 */
export const sortAssignmentsByStudentName = (assignments) => {
    if (!Array.isArray(assignments) || assignments.length === 0) {
        return assignments;
    }

    return assignments.sort((a, b) => {
        if (a.student_details && b.student_details) {
            const nameA = `${a.student_details.name || ''} ${a.student_details.family_name || ''} ${a.student_details.surname || ''}`.trim().toLowerCase();
            const nameB = `${b.student_details.name || ''} ${b.student_details.family_name || ''} ${b.student_details.surname || ''}`.trim().toLowerCase();
            return nameA.localeCompare(nameB);
        }
        return 0;
    });
};