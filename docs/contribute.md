# Contributing

Contributions to the Scriptify monorepo are welcome! If you would like to contribute, please follow these steps:

1. Fork the repository on GitHub.

2. Clone your forked repository to your local machine:

   ```
   git clone https://github.com/your-username/scriptify
   ```

3. Create a new branch for your changes:

   ```
   git checkout -b my-feature
   ```

4. Make your changes and commit them with descriptive messages:

   ```
   git commit -m "Add new feature"
   ```

5. Push your changes to your forked repository:

   ```
   git push origin my-feature
   ```

6. Visit the original repository on GitHub and create a new pull request with your changes.

Please provide a clear and descriptive pull request message that explains the purpose and changes of your contribution.

## Adding a Changeset

To facilitate release tracking, we use the [changesets](https://github.com/changesets/changesets) tool. When making a contribution, please include a changeset file in your pull request.

1. From the root directory of the monorepo, create a changeset using the changesets CLI:

   ```
   pnpm changeset
   ```

   This will guide you through creating a changeset and adding the necessary information.

3. Commit the changeset file along with your code changes.

Including a changeset helps us keep track of the changes made in each release and ensures a smoother release process.