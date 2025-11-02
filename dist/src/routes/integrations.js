import { auth } from '../middleware/auth';
import { Hono } from 'hono';
import { validator } from 'hono/validator';
import { z } from 'zod';
// export type Integration = InferSelectModel<typeof integrations>;
const integrationsRoutes = new Hono();
// Swagger documentation comments are not directly supported with Hono in this setup.
// They should be moved to a separate documentation generation process or removed.
// /**
// * @swagger
// * /api/integrations:
// *   get:
// *     summary: List available and configured integrations for the Integrations view
// *     tags: [Integrations]
// *     security:
// *       - CookieAuth: []
// *     responses:
// *       200:
// *         description: Successfully retrieved integrations list
// *         content:
// *           application/json:
// *             schema:
// *               type: array
// *               items:
// *                 type: object
// *                 properties:
// *                   id:
// *                     type: integer
// *                     example: 1
// *                   name:
// *                     type: string
// *                     example: "Google Classroom"
// *                   status:
// *                     type: string
// *                     enum: ["configured", "available"]
// *                     example: "configured"
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       500:
// *         description: Server error
// */
integrationsRoutes.get('/', auth, async (c) => {
    try {
        // Placeholder for fetching integrations
        const integrations = [
            {
                id: 1,
                name: 'Google Classroom',
                status: 'configured',
            },
            {
                id: 2,
                name: 'Zoom Integration',
                status: 'available',
            },
        ];
        return c.json(integrations);
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
});
const createIntegrationSchema = z.object({
    name: z.string().nonempty("Integration name is required"),
    configuration: z.record(z.any()).optional(), // Assuming configuration can be any JSON object
});
// /**
// * @swagger
// * /api/integrations:
// *   post:
// *     summary: Add or configure a new integration
// *     tags: [Integrations]
// *     security:
// *       - CookieAuth: []
// *     requestBody:
// *       required: true
// *       content:
// *         application/json:
// *           schema:
// *             type: object
// *             required:
// *               - name
// *               - configuration
// *             properties:
// *               name:
// *                 type: string
// *                 example: "New Integration"
// *               configuration:
// *                 type: object
// *                 description: JSON object containing integration-specific configuration
// *                 example:
// *                   apiKey: "your_api_key"
// *                   enabled: true
// *     responses:
// *       201:
// *         description: Integration added/configured successfully
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 msg:
// *                   type: string
// *                   example: Integration added/configured successfully
// *                 integration:
// *                   type: object
// *                   properties:
// *                     id:
// *                       type: integer
// *                     name:
// *                       type: string
// *                     status:
// *                       type: string
// *       400:
// *         description: Invalid input
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       500:
// *         description: Server error
// */
integrationsRoutes.post('/', auth, validator("json", (value, c) => {
    const parsed = createIntegrationSchema.safeParse(value);
    if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
}), async (c) => {
    const { name, configuration } = c.req.valid("json");
    try {
        // Placeholder for adding/configuring a new integration
        console.log(`Adding/configuring integration: ${name} with config:`, configuration);
        const newIntegration = {
            id: Math.floor(Math.random() * 1000) + 3,
            name: name,
            status: 'configured',
            configuration: configuration || {},
        };
        // You'll replace this with actual database operations using an Integration model
        return c.json({ msg: 'Integration added/configured successfully', integration: newIntegration }, 201);
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
});
const updateIntegrationSchema = z.object({
    name: z.string().nonempty("Integration name is required").optional(),
    configuration: z.record(z.any()).optional(),
    status: z.enum(["configured", "available", "disabled"]).optional(),
});
// /**
// * @swagger
// * /api/integrations/{id}:
// *   put:
// *     summary: Update an existing integration's settings
// *     tags: [Integrations]
// *     security:
// *       - CookieAuth: []
// *     parameters:
// *       - in: path
// *         name: id
// *         required: true
// *         schema:
// *           type: integer
// *         description: The ID of the integration to update
// *     requestBody:
// *       required: true
// *       content:
// *         application/json:
// *           schema:
// *             type: object
// *             properties:
// *               name:
// *                 type: string
// *                 example: "Updated Integration Name"
// *               configuration:
// *                 type: object
// *                 description: JSON object containing updated integration-specific configuration
// *                 example:
// *                   apiKey: "your_new_api_key"
// *                   enabled: true
// *               status:
// *                 type: string
// *                 enum: ["configured", "available", "disabled"]
// *                 description: The new status of the integration
// *     responses:
// *       200:
// *         description: Integration updated successfully
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 msg:
// *                   type: string
// *                   example: Integration updated successfully
// *                 integration:
// *                   type: object
// *                   properties:
// *                     id:
// *                       type: integer
// *                     name:
// *                       type: string
// *                     status:
// *                       type: string
// *       400:
// *         description: Invalid input
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       404:
// *         description: Integration not found
// *       500:
// *         description: Server error
// */
integrationsRoutes.put('/:id', auth, validator("json", (value, c) => {
    const parsed = updateIntegrationSchema.safeParse(value);
    if (!parsed.success) {
        return c.json({ errors: parsed.error.issues }, 400);
    }
    return parsed.data;
}), async (c) => {
    const { id } = c.req.param();
    const { name, configuration, status } = c.req.valid("json");
    try {
        // Placeholder for updating an integration
        console.log(`Updating integration ${id}: Name: ${name}, Config:`, configuration, `Status: ${status}`);
        const updatedIntegration = {
            id: parseInt(id),
            name: name || "Existing Integration",
            status: status || "configured",
            configuration: configuration || {},
        };
        // You'll replace this with actual database operations using an Integration model
        return c.json({ msg: 'Integration updated successfully', integration: updatedIntegration });
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
});
// /**
// * @swagger
// * /api/integrations/{id}:
// *   delete:
// *     summary: Remove an integration
// *     tags: [Integrations]
// *     security:
// *       - CookieAuth: []
// *     parameters:
// *       - in: path
// *         name: id
// *         required: true
// *         schema:
// *           type: integer
// *         description: The ID of the integration to remove
// *     responses:
// *       200:
// *         description: Integration removed successfully
// *         content:
// *           application/json:
// *             schema:
// *               type: object
// *               properties:
// *                 msg:
// *                   type: string
// *                   example: Integration removed successfully
// *       401:
// *         description: Unauthorized - Missing or invalid access token
// *       404:
// *         description: Integration not found
// *       500:
// *         description: Server error
// */
integrationsRoutes.delete('/:id', auth, async (c) => {
    const { id } = c.req.param();
    try {
        // Placeholder for removing an integration
        console.log(`Removing integration with ID: ${id}`);
        // You'll replace this with actual database operations using an Integration model
        return c.json({ msg: 'Integration removed successfully' });
    }
    catch (err) {
        console.error(err.message);
        return c.json({ msg: "Server Error" }, 500);
    }
});
export default integrationsRoutes;
