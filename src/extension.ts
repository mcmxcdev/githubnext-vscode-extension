import * as git from 'simple-git';
import * as vscode from 'vscode';

type ConflictMarker = {
  fileName: string;
  textContent: string;
};

const autoRemoveMissedMergeConflictMarkers = (
  conflictMarkers: ConflictMarker[],
  rootPath: string,
) => {
  vscode.window
    .showInformationMessage(
      `Merge conflict markers found in ${conflictMarkers.length} file(s).`,
      ...[
        { title: 'Remove all', shouldClose: true },
        { title: 'Cancel', shouldClose: true },
      ],
    )
    .then((selection) => {
      if (selection && selection.title === 'Remove all') {
        conflictMarkers.forEach((conflictMarker) => {
          const textWithoutMergeConflictMarkers = conflictMarker.textContent
            .replace(/<<<<<<< HEAD/g, '')
            .replace(/=======/g, '')
            .replace(/>>>>>>>\ .*/g, '');

          const fileUri = vscode.Uri.file(`${rootPath}/${conflictMarker.fileName}`);

          vscode.workspace.openTextDocument(fileUri).then((doc) => {
            const workspaceEdit = new vscode.WorkspaceEdit();

            workspaceEdit.replace(
              doc.uri,
              new vscode.Range(0, 0, doc.lineCount, 0),
              textWithoutMergeConflictMarkers,
            );
            vscode.workspace.applyEdit(workspaceEdit);
          });
        });

        vscode.window.showInformationMessage(
          'Merge conflict markers automatically removed. Make sure to double check the applied changes.',
        );
      }
    });
};

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    'extension.autoRemoveMissedMergeConflictMarkers',
    async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;

      if (!workspaceFolders) {
        vscode.window.showErrorMessage('No open workspace folder');
        return;
      }

      const rootPath = workspaceFolders[0].uri.fsPath;

      const gitInstance = git.simpleGit(rootPath);
      const workingTreeStatus = await gitInstance.status();
      const stagedFiles = workingTreeStatus.staged;

      const conflictMarkers: ConflictMarker[] = [];

      for (const stagedFile of stagedFiles) {
        const fileUri = vscode.Uri.file(`${rootPath}/${stagedFile}`);
        const document = await vscode.workspace.openTextDocument(fileUri);
        const textContent = document.getText();

        if (textContent.includes('<<<<<<< HEAD')) {
          vscode.window.showWarningMessage(
            `Merge conflict markers found in staged file: ${stagedFile}`,
          );

          conflictMarkers.push({ fileName: stagedFile, textContent });
        }
      }

      if (conflictMarkers.length > 0) {
        autoRemoveMissedMergeConflictMarkers(conflictMarkers, rootPath);
      } else {
        vscode.window.showInformationMessage('No merge conflict markers found in staged files.');
      }
    },
  );

  context.subscriptions.push(disposable);
}
