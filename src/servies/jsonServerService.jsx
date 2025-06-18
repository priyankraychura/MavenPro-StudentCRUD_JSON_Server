const serverService = {
    fetchData: async () => {
        try {
            const response = await fetch('http://localhost:3000/students')
            const result = await response.json();

            return result;
        } catch (error) {
            console.log(error)
        }
    },
    addData: async () => {
        try {
            const response = await fetch("http://localhost:3000/students", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();

            return result
        } catch (error) {
            console.log(error);
        }
    }
}

export default serverService;