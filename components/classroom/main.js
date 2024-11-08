// main.js

import { getProjectIDFromURL } from './groups/utils/project.js';
import Roles from "./roles.mjs";
import hasPermission from "./hasPermission";
import { Action, Scope, Entity } from './permissions_parameters.mjs';


// Function to fetch project data from the TPEN API
async function fetchProjectData(projectId) {
    const bearerToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik9FVTBORFk0T1RVNVJrRXlOREl5TTBFMU1FVXdNMFUyT0RGQk9UaEZSa1JDTXpnek1FSTRNdyJ9.eyJodHRwOi8vc3RvcmUucmVydW0uaW8vYWdlbnQiOiJodHRwczovL3N0b3JlLnJlcnVtLmlvL3YxL2lkLzY2YjliMzE5OTMyNTgyMzBjYTM4NmY4NiIsImh0dHA6Ly9yZXJ1bS5pby9hcHBfZmxhZyI6WyJ0cGVuIl0sImh0dHA6Ly9kdW5iYXIucmVydW0uaW8vYXBwX2ZsYWciOlsidHBlbiJdLCJodHRwOi8vcmVydW0uaW8vdXNlcl9yb2xlcyI6eyJyb2xlcyI6WyJkdW5iYXJfdXNlcl9wdWJsaWMiLCJnbG9zc2luZ191c2VyX3B1YmxpYyIsImxyZGFfdXNlcl9wdWJsaWMiLCJyZXJ1bV91c2VyX3B1YmxpYyIsInRwZW5fdXNlcl9wdWJsaWMiXX0sImh0dHA6Ly9kdW5iYXIucmVydW0uaW8vdXNlcl9yb2xlcyI6eyJyb2xlcyI6WyJkdW5iYXJfdXNlcl9wdWJsaWMiLCJnbG9zc2luZ191c2VyX3B1YmxpYyIsImxyZGFfdXNlcl9wdWJsaWMiLCJyZXJ1bV91c2VyX3B1YmxpYyIsInRwZW5fdXNlcl9wdWJsaWMiXX0sImlzcyI6Imh0dHBzOi8vY3ViYXAuYXV0aDAuY29tLyIsInN1YiI6ImF1dGgwfDY2YjliMzE4YzZhMjU4MDZjOTgxMDg3YyIsImF1ZCI6WyJodHRwczovL2N1YmFwLmF1dGgwLmNvbS9hcGkvdjIvIiwiaHR0cHM6Ly9jdWJhcC5hdXRoMC5jb20vdXNlcmluZm8iXSwiaWF0IjoxNzI4Njc1MDczLCJleHAiOjE3Mjg2ODIyNzMsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgdXBkYXRlOmN1cnJlbnRfdXNlcl9tZXRhZGF0YSBvZmZsaW5lX2FjY2VzcyIsImF6cCI6ImJCdWdGTVdIVW8xT2huU1pNcFlVWHhpM1kxVUpJN0tsIn0.TRmYqcEIGh5lvt_6mjX6CULsiIthh-P-gWLAl_JDuKjZsbbw-gSzX5ogQ70Iya9vxGdbBemYdKMqW2I8CN7w-4MCt4GMQvLNDXbaf8HUs4ohVqMzkpRvjjqwHtWzrIYO_f8ceKU8KFeu3czGmZ0_1_R30zTrEty0WMEVfhAI1v7qUiE5VY5tef-rbX19lcAMUku4b0xs8lKzlKFzsekSFtZsJ-pOoytMLWoEIeU_hxE8AmdCSm3W9Hg3jAVVIBDMKpY0foI4BSAsCWzfT9qnjBTbKtixM4k4MWyAJISERn9coIJFOG9ae6GP8JiVrIMD9je0gxDSxik8HnRINBsmLA'
    const apiUrl = `https://dev.api.t-pen.org/project/${projectId}`;
    
    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${bearerToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const projectData = await response.json();
        displayProjectData(projectData);
    } catch (error) {
        console.error('Error fetching project data:', error);
    }
}

// Function to display project data in the HTML
function displayProjectData(data) {
    document.getElementById('projectId').textContent = `Project ID: ${data._id}`;
    document.getElementById('projectName').textContent = `Project Name: ${data.name}`;
    document.getElementById('projectCreator').textContent = `Project Creator: ${data.creator}`;
}

// On page load, fetch the project data
window.onload = () => {
    const projectId = getProjectIDFromURL();
    if (projectId) {
        fetchProjectData(projectId);
    } else {
        console.log('Project ID not found in URL');
    }
};

const ROLE_HIERARCHY = [Roles.OWNER, Roles.LEADER, Roles.CONTRIBUTOR];

// identifies the highest privilege role from a list of user roles and returns the top-ranked valid role
function getHighestPrivilegeRole(userRoles) {
    const validRoles = [];

    // Loop through each role in userRoles
    for (let i = 0; i < userRoles.length; i++) {
        const role = userRoles[i];

        // Check if the role is in ROLE_HIERARCHY
        if (ROLE_HIERARCHY.includes(role)) {
            validRoles.push(role); // Add to validRoles if it's a recognized role
        } else {
            console.warn(`403 Forbidden: Invalid role "${role}" detected. Access denied.`);
            // Display the error message if the role is invalid
            const errorMsgElement = document.getElementById('error-msg');
            errorMsgElement.textContent = `403 Forbidden: Invalid role "${role}" detected. Access denied.`;
            errorMsgElement.style.display = 'block';
            return null; // Exit the function early if an invalid role is found
        }
    }

    // Find the highest privilege role in validRoles based on ROLE_HIERARCHY
    for (let i = 0; i < ROLE_HIERARCHY.length; i++) {
        if (validRoles.includes(ROLE_HIERARCHY[i])) {
            return ROLE_HIERARCHY[i]; // Return the first (highest privilege) valid role found
        }
    }

    // Return null if no valid roles are found
    return null;
}


// checks if a user, based on their multiple roles, has permission to perform a specified action
function userHasMultipleRoles(userRoles, action, scope, entity) {
    const errorMsgElement = document.getElementById('error-msg');
    
    // Loop through all roles to check if any role has permission
    for (let i = 0; i < userRoles.length; i++) {
        try {
            if (hasPermission(userRoles[i], action, scope, entity)) {
                return true; // Allow access if any role has permission
            }
        } catch (error) {
            // If an error is thrown (invalid role or no permission), log it and display it
            console.warn(error.message);
            errorMsgElement.textContent = error.message;
            errorMsgElement.style.display = 'block';
        }
    }

    // If none of the roles allowed access, display a 403 error message
    errorMsgElement.textContent = "403 Forbidden: None of the user's roles permit this action.";
    errorMsgElement.style.display = 'block';
    return false; // Indicate that access was not granted
}